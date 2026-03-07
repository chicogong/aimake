/**
 * generate_tts_segment tool
 * Converts a single script segment to audio via TTS API.
 * Audio is stored in the shared AudioStore.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { getTTSClient } from '../utils/shared-clients.js';
import { audioStore } from '../utils/audio-store.js';
import { toolSuccess, toolError } from './tool-helpers.js';

export const generateTtsSegmentTool = tool(
  'generate_tts_segment',
  'Convert a text segment to speech audio using TTS API. ' +
    'Audio is stored internally — only metadata (index, duration) is returned. ' +
    'Call this for each segment in the script.',
  {
    jobId: z.string().describe('The job ID'),
    text: z.string().describe('The text to convert to speech'),
    voiceId: z.string().describe('Voice ID (e.g., "sf-alex", "sf-bella")'),
    speed: z.number().optional().describe('Speech speed multiplier (default: 1.0)'),
    index: z.number().int().describe('Segment index for ordering'),
  },
  async ({ jobId, text, voiceId, speed, index }) => {
    try {
      const client = getTTSClient();
      const result = await client.generateSegment({
        text,
        voiceId,
        speed: speed ?? 1.0,
      });

      const { audioBase64, duration } = result;
      audioStore.set(jobId, { index, audioBase64, duration });

      return toolSuccess({ index, duration });
    } catch (error) {
      return toolError(error instanceof Error ? error.message : 'TTS generation failed');
    }
  }
);
