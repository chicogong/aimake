/**
 * batch_generate_tts tool
 * Generates multiple TTS segments in parallel.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { getTTSClient } from '../utils/shared-clients.js';
import { audioStore } from '../utils/audio-store.js';
import { toolSuccess, toolError } from './tool-helpers.js';

export const batchGenerateTtsTool = tool(
  'batch_generate_tts',
  'Generate multiple audio segments in parallel from a list of script lines. ' +
    'Use this after generating the full script to speed up synthesis.',
  {
    jobId: z.string().describe('The job ID'),
    segments: z
      .array(
        z.object({
          index: z.number().int().describe('The sequence index of this segment'),
          text: z.string().describe('The text to synthesize'),
          voiceId: z.string().describe('The voice ID to use for this segment'),
        })
      )
      .describe('List of segments to synthesize in parallel'),
  },
  async (params) => {
    return batchGenerateTtsHandler(params);
  }
);

export async function batchGenerateTtsHandler({
  jobId,
  segments,
}: {
  jobId: string;
  segments: Array<{ index: number; text: string; voiceId: string }>;
}) {
  try {
    const ttsClient = getTTSClient();

    console.info(`[${jobId}] Batch TTS: Processing ${segments.length} segments in parallel...`);

    // Run all synthesis requests concurrently
    const results = await Promise.all(
      segments.map(async (seg) => {
        const result = await ttsClient.generateSegment({
          text: seg.text,
          voiceId: seg.voiceId,
        });
        audioStore.set(jobId, {
          index: seg.index,
          audioBase64: result.audioBase64,
          duration: result.duration,
        });
        return { duration: result.duration };
      })
    );

    return toolSuccess({
      count: results.length,
      totalDurationEstimate: results.reduce((acc, r) => acc + r.duration, 0),
    });
  } catch (error) {
    console.error(`[${jobId}] Batch TTS failed:`, error);
    return toolError(error instanceof Error ? error.message : 'Batch TTS failed');
  }
}
