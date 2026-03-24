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
import { toolSuccess, toolError } from './tool-helpers.js';

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

    console.info(`[${jobId}] Batch TTS: Processing ${segments.length} segments (concurrency: ${MAX_CONCURRENCY})...`);

    const results = await mapWithConcurrency(
      segments,
      async (seg) => {
        const result = await ttsClient.generateSegment({
          text: seg.text,
          voiceId: seg.voiceId,
        });
        audioStore.set(jobId, {
          index: seg.index,
          audioBase64: result.audioBase64,
          duration: result.duration,
        });
        return { index: seg.index, duration: result.duration };
      },
      MAX_CONCURRENCY
    );

    const succeeded = results.filter(
      (r): r is PromiseSettledResult<{ index: number; duration: number }> & { status: 'fulfilled' } =>
        r.status === 'fulfilled'
    );
    const failed = results.filter((r) => r.status === 'rejected');

    if (succeeded.length === 0) {
      const firstErr = failed[0] && 'reason' in failed[0]
        ? (failed[0].reason as Error)?.message || 'Unknown error'
        : 'All segments failed';
      return toolError(`All ${segments.length} TTS segments failed. First error: ${firstErr}`);
    }

    const totalDuration = succeeded.reduce((acc, r) => acc + r.value.duration, 0);

    console.info(
      `[${jobId}] Batch TTS done: ${succeeded.length}/${segments.length} succeeded, ` +
        `${failed.length} failed, total duration: ${totalDuration.toFixed(1)}s`
    );

    if (failed.length > 0) {
      const failedIndices = results
        .map((r, i) => (r.status === 'rejected' ? segments[i].index : null))
        .filter((i) => i !== null);

      return toolSuccess({
        count: succeeded.length,
        failedCount: failed.length,
        failedIndices,
        totalDurationEstimate: totalDuration,
        message: `${succeeded.length} segments synthesized, ${failed.length} failed (indices: ${failedIndices.join(', ')}). Use generate_tts_segment to retry failed ones individually.`,
      });
    }

    return toolSuccess({
      count: succeeded.length,
      failedCount: 0,
      totalDurationEstimate: totalDuration,
    });
  } catch (error) {
    console.error(`[${jobId}] Batch TTS failed:`, error);
    return toolError(error instanceof Error ? error.message : 'Batch TTS failed');
  }
}
