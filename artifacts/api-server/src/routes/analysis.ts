import { Router, type IRouter } from "express";
import { db, analysisRecordsTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  AnalyzeBpmBody,
  AnalyzeBpmResponse,
  GetAnalysisHistoryResponse,
  ClearAnalysisHistoryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function detectBpm(audioData: string, sampleRate: number): { bpm: number; confidence: number } {
  try {
    const raw = Buffer.from(audioData, "base64");
    const samples = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);

    if (samples.length < sampleRate) {
      return { bpm: 0, confidence: 0 };
    }

    const windowSize = Math.min(samples.length, sampleRate * 8);
    const window = samples.slice(0, windowSize);

    const energyFrameSize = Math.floor(sampleRate / 100);
    const energies: number[] = [];

    for (let i = 0; i + energyFrameSize < window.length; i += energyFrameSize) {
      let energy = 0;
      for (let j = 0; j < energyFrameSize; j++) {
        energy += window[i + j] * window[i + j];
      }
      energies.push(energy / energyFrameSize);
    }

    const minPeriodFrames = Math.floor(60 / 200 * 100);
    const maxPeriodFrames = Math.floor(60 / 60 * 100);

    let bestPeriod = 0;
    let bestCorrelation = -Infinity;

    for (let period = minPeriodFrames; period <= maxPeriodFrames; period++) {
      let correlation = 0;
      let count = 0;
      for (let i = 0; i + period < energies.length; i++) {
        correlation += energies[i] * energies[i + period];
        count++;
      }
      if (count > 0) {
        correlation /= count;
        if (correlation > bestCorrelation) {
          bestCorrelation = correlation;
          bestPeriod = period;
        }
      }
    }

    if (bestPeriod === 0) {
      return { bpm: 0, confidence: 0 };
    }

    const periodSeconds = bestPeriod / 100;
    const bpm = 60 / periodSeconds;

    const avgEnergy = energies.reduce((a, b) => a + b, 0) / energies.length;
    const maxEnergy = Math.max(...energies);
    const confidence = Math.min(1, maxEnergy / (avgEnergy * 3 + 0.001));

    return {
      bpm: Math.round(bpm * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
    };
  } catch {
    return { bpm: 0, confidence: 0 };
  }
}

router.post("/bpm", async (req, res) => {
  const body = AnalyzeBpmBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request", message: "audioData and sampleRate are required" });
    return;
  }

  const { audioData, sampleRate, label } = body.data;
  const { bpm, confidence } = detectBpm(audioData, sampleRate);

  const [record] = await db
    .insert(analysisRecordsTable)
    .values({
      bpm,
      confidence,
      label: label ?? null,
    })
    .returning();

  const result = AnalyzeBpmResponse.parse({
    id: record.id,
    bpm: record.bpm,
    confidence: record.confidence,
    label: record.label ?? undefined,
    analyzedAt: record.analyzedAt.toISOString(),
  });

  res.json(result);
});

router.get("/history", async (_req, res) => {
  const records = await db
    .select()
    .from(analysisRecordsTable)
    .orderBy(desc(analysisRecordsTable.analyzedAt))
    .limit(50);

  const result = GetAnalysisHistoryResponse.parse(
    records.map((r) => ({
      id: r.id,
      bpm: r.bpm,
      confidence: r.confidence,
      label: r.label ?? undefined,
      analyzedAt: r.analyzedAt.toISOString(),
    }))
  );

  res.json(result);
});

router.delete("/history", async (_req, res) => {
  await db.delete(analysisRecordsTable);

  const result = ClearAnalysisHistoryResponse.parse({
    success: true,
    message: "History cleared",
  });

  res.json(result);
});

export default router;
