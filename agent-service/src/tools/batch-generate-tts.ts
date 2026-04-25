/**
 * batch_generate_tts tool
 * Generates multiple TTS segments with concurrency control.
 *
 * R3: Uses concurrency-limited execution + partial failure tolerance.
 *     Single segment failures no longer kill the entire batch.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { getTTSClient } from '../utils/shared-clients.js';
import { audioStore } from '../utils/audio-store.js';
import { toolSuccess, toolError, withErrorHandling } from './tool-helpers.js';

const MAX_CONCURRENCY = 5;

/**
 * Run async tasks with a concurrency limit, collecting all results (settled).
 */
async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const i = nextIndex++;
      try {
        const value = await fn(items[i]);
        results[i] = { status: 'fulfilled', value };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

export const batchGenerateTtsTool = tool(
  'batch_generate_tts',
  'Generate multiple audio segments in parallel from a list of script lines. ' +
    'Use this after generating the full script to speed up synthesis. ' +
    'Tolerates partial failures — succeeded segments are kept.',
  {
    jobId: z.string().describe('The job ID'),
    segments: z
      .array(
        z.object({
          index: z.number().int().describe('The sequence index of this segment'),
          text: z.string().describe('The text to synthesize'),
          voiceId: z.string().describe('The voice ID to use for this segment'),
          speed: z.number().optional().describe('Speech speed multiplier (default: 1.0)'),
        })
      )
      .describe('List of segments to synthesize in parallel'),
  },
  (params) => batchGenerateTtsHandler(params)
);

interface BatchSegment {
  index: number;
  text: string;
  voiceId: string;
  speed?: number;
}

export async function batchGenerateTtsHandler({
  jobId,
  segments,
}: {
  jobId: string;
  segments: BatchSegment[];
}) {
  return withErrorHandling(async () => {
    const ttsClient = getTTSClient();

    console.info(
      `[${jobId}] batch tts: ${segments.length} segments (concurrency ${MAX_CONCURRENCY})`
    );

    const results = await mapWithConcurrency(
      segments,
      async (seg) => {
        const { audioBase64, duration } = await ttsClient.generateSegment({
          text: seg.text,
          voiceId: seg.voiceId,
          speed: seg.speed ?? 1.0,
        });
        audioStore.set(jobId, { index: seg.index, audioBase64, duration });
        return { index: seg.index, duration };
      },
      MAX_CONCURRENCY
    );

    const succeeded = results
      .map((r, i) => (r.status === 'fulfilled' ? { ...r.value } : null))
      .filter((r): r is { index: number; duration: number } => r !== null);

    const failedIndices = results
      .map((r, i) => (r.status === 'rejected' ? segments[i].index : null))
      .filter((i): i is number => i !== null);

    if (succeeded.length === 0) {
      const reason =
        results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      const firstErr = reason?.reason instanceof Error ? reason.reason.message : 'Unknown error';
      return toolError(`All ${segments.length} TTS segments failed. First error: ${firstErr}`);
    }

    const totalDuration = succeeded.reduce((acc, r) => acc + r.duration, 0);

    console.info(
      `[${jobId}] batch tts done: ${succeeded.length}/${segments.length} succeeded, ` +
        `${failedIndices.length} failed, total ${totalDuration.toFixed(1)}s`
    );

    return toolSuccess({
      count: succeeded.length,
      failedCount: failedIndices.length,
      ...(failedIndices.length > 0
        ? {
            failedIndices,
            message: `${succeeded.length} segments synthesized, ${failedIndices.length} failed (indices: ${failedIndices.join(', ')}). Use generate_tts_segment to retry failed ones individually.`,
          }
        : {}),
      totalDurationEstimate: totalDuration,
    });
  }, `[${jobId}] Batch TTS failed`);
}
