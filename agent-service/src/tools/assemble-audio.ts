/**
 * assemble_audio tool
 * Reads all stored audio segments and concatenates them.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { audioStore } from '../utils/audio-store.js';
import { concatenateSegments } from '../utils/audio.js';
import { toolSuccess, toolError, withErrorHandling } from './tool-helpers.js';

export const assembleAudioTool = tool(
  'assemble_audio',
  'Concatenate all stored audio segments into a single audio file. ' +
    'Segments are read from internal storage (populated by generate_tts_segment). ' +
    'The assembled audio is stored internally for upload_audio to use.',
  {
    jobId: z.string().describe('The job ID'),
    gapMs: z
      .number()
      .int()
      .optional()
      .describe('Silence gap between segments in milliseconds (default: 500)'),
  },
  ({ jobId, gapMs }) =>
    withErrorHandling(async () => {
      const segments = audioStore.getAll(jobId);
      if (segments.length === 0) {
        return toolError('No audio segments found for this job');
      }

      const { audioBase64, totalDuration } = concatenateSegments(segments, gapMs ?? 500);
      audioStore.setAssembled(jobId, { audioBase64, totalDuration });

      return toolSuccess({ duration: totalDuration, segmentsCount: segments.length });
    }, 'Audio assembly failed')
);
