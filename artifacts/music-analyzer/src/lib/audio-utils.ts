/**
 * Utility functions for recording audio via Web Audio API,
 * converting to Base64, and performing client-side BPM analysis.
 */

export async function recordAudio(durationSeconds: number): Promise<{ buffer: AudioBuffer, blob: Blob }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return new Promise((resolve, reject) => {
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        resolve({ buffer: audioBuffer, blob });
      } catch (err) {
        reject(err);
      }
    };

    mediaRecorder.start();
    setTimeout(() => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }, durationSeconds * 1000);
  });
}

export function audioBufferToBase64(buffer: AudioBuffer): string {
  // We extract the first channel (mono) and convert Float32 to Int16 PCM
  // This reduces payload size significantly for the backend
  const channelData = buffer.getChannelData(0);
  const buffer16 = new Int16Array(channelData.length);
  
  for (let i = 0; i < channelData.length; i++) {
    const s = Math.max(-1, Math.min(1, channelData[i]));
    buffer16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const bytes = new Uint8Array(buffer16.buffer);
  let binary = '';
  // Chunking to avoid Maximum call stack size exceeded on large buffers
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  
  return btoa(binary);
}

/**
 * A lightweight client-side BPM estimation using peak detection on an amplitude envelope.
 * Provides instant feedback before the backend processing finishes.
 */
export function estimateBpmClientSide(buffer: AudioBuffer): { bpm: number; confidence: number } {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Create an amplitude envelope by downsampling
  const downsampleRate = 100; // 100 samples per second
  const blockSize = Math.floor(sampleRate / downsampleRate);
  const envelope: number[] = [];
  
  for (let i = 0; i < data.length; i += blockSize) {
    let sum = 0;
    for (let j = 0; j < blockSize && i + j < data.length; j++) {
      sum += Math.abs(data[i + j]);
    }
    envelope.push(sum / blockSize);
  }
  
  // Find dynamic threshold
  let maxAmp = 0;
  for (const val of envelope) if (val > maxAmp) maxAmp = val;
  const threshold = maxAmp * 0.4;
  
  // Detect peaks
  const peaks: number[] = [];
  for (let i = 1; i < envelope.length - 1; i++) {
    if (envelope[i] > threshold && envelope[i] > envelope[i-1] && envelope[i] > envelope[i+1]) {
      peaks.push(i);
    }
  }
  
  // Calculate BPMs from intervals between peaks
  const bpmCounts: Record<number, number> = {};
  for (let i = 1; i < peaks.length; i++) {
    const intervalSamples = peaks[i] - peaks[i-1];
    const intervalSeconds = intervalSamples / downsampleRate;
    const bpm = Math.round(60 / intervalSeconds);
    
    // Filter out unlikely BPMs
    if (bpm >= 60 && bpm <= 200) {
      bpmCounts[bpm] = (bpmCounts[bpm] || 0) + 1;
    } else if (bpm > 200 && bpm <= 400) {
      // Halve double-time detections
      const halfBpm = Math.round(bpm / 2);
      if (halfBpm >= 60 && halfBpm <= 200) {
        bpmCounts[halfBpm] = (bpmCounts[halfBpm] || 0) + 1;
      }
    }
  }
  
  // Find the most frequent BPM
  let bestBpm = 120; // Default fallback
  let maxCount = 0;
  let totalCount = 0;
  
  for (const [bpmStr, count] of Object.entries(bpmCounts)) {
    totalCount += count;
    if (count > maxCount) {
      maxCount = count;
      bestBpm = parseInt(bpmStr);
    }
  }
  
  const confidence = totalCount > 0 ? maxCount / totalCount : 0;
  
  return { bpm: bestBpm, confidence };
}
