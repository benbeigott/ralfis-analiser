import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalyzeBpm, getGetAnalysisHistoryQueryKey } from '@workspace/api-client-react';
import { recordAudio, audioBufferToBase64, estimateBpmClientSide } from '../lib/audio-utils';

export type SessionState = 'idle' | 'recording' | 'analyzing' | 'result' | 'error';

export function useBpmSession() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<SessionState>('idle');
  const [result, setResult] = useState<{ bpm: number; confidence: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const analyzeMutation = useAnalyzeBpm({
    mutation: {
      onSuccess: (data) => {
        setResult({ bpm: data.bpm, confidence: data.confidence });
        setState('result');
        // Invalidate history to fetch the newly saved record
        queryClient.invalidateQueries({ queryKey: getGetAnalysisHistoryQueryKey() });
      },
      onError: (error) => {
        console.error("Backend analysis failed:", error);
        // We keep the client-side result but show a subtle warning
        // State remains 'result' since we have the client calculation
      }
    }
  });

  const startAnalysis = useCallback(async () => {
    try {
      setState('recording');
      setResult(null);
      setErrorMsg(null);
      setProgress(0);

      // Simulate progress bar during the 8 seconds recording
      const duration = 8000;
      const interval = 100;
      let elapsed = 0;
      const timer = setInterval(() => {
        elapsed += interval;
        setProgress(Math.min((elapsed / duration) * 100, 100));
      }, interval);

      // 1. Record Audio (8 seconds)
      const { buffer } = await recordAudio(8);
      clearInterval(timer);
      setProgress(100);
      setState('analyzing');

      // 2. Client-side estimation (immediate feedback)
      const localResult = estimateBpmClientSide(buffer);
      if (localResult.confidence > 0) {
        setResult(localResult);
      }

      // 3. Prepare data for backend
      const base64Data = audioBufferToBase64(buffer);
      
      // 4. Send to backend
      analyzeMutation.mutate({
        data: {
          audioData: base64Data,
          sampleRate: buffer.sampleRate,
          label: `Track ${new Date().toLocaleTimeString()}`
        }
      });

    } catch (err: any) {
      console.error("Audio recording error:", err);
      setState('error');
      setErrorMsg(err.message || "Mikrofon-Zugriff verweigert oder Fehler aufgetreten.");
    }
  }, [analyzeMutation]);

  const reset = useCallback(() => {
    setState('idle');
    setResult(null);
    setErrorMsg(null);
    setProgress(0);
  }, []);

  return {
    state,
    result,
    errorMsg,
    progress,
    startAnalysis,
    reset,
    isPending: analyzeMutation.isPending
  };
}
