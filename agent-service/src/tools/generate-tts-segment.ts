/**
 * generate_tts_segment tool
 * Converts a single script segment to audio via TTS API.
 * Audio is stored in the shared AudioStore.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { TTSClient } from '../utils/tts-client.js';
import { audioStore } from '../utils/audio-store.js';

let ttsClient: TTSClient | null = null;

function getClient(): TTSClient {
  if (!ttsClient) {
    ttsClient = new TTSClient({
      siliconflowApiKey: process.env.SILICONFLOW_API_KEY,
    });
  }
  return ttsClient;
}

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
      const client = getClient();
      const result = await client.generateSegment({
        text,
        voiceId,
        speed: speed ?? 1.0,
      });

      audioStore.set(jobId, {
        index,
        audioBase64: result.audioBase64,
        duration: result.duration,
      });

      const storedCount = audioStore.count(jobId);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              index,
              duration: result.duration,
              storedSegments: storedCount,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              index,
              error: error instanceof Error ? error.message : 'TTS generation failed',
            }),
          },
        ],
      };
    }
  }
);
