/**
 * upload_audio tool
 * Reads the assembled audio from AudioStore and uploads it.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { CallbackClient } from '../utils/callback-client.js';
import { audioStore } from '../utils/audio-store.js';

let client: CallbackClient | null = null;

function getClient(): CallbackClient {
  if (!client) {
    const baseUrl = process.env.WORKERS_API_URL;
    const secret = process.env.INTERNAL_API_SECRET;
    if (!baseUrl || !secret) {
      throw new Error('WORKERS_API_URL and INTERNAL_API_SECRET must be set');
    }
    client = new CallbackClient(baseUrl, secret);
  }
  return client;
}

export const uploadAudioTool = tool(
  'upload_audio',
  'Upload the assembled audio to persistent storage. ' +
    'Call this as the last step after assemble_audio. ' +
    'The audio is read from internal storage.',
  {
    jobId: z.string().describe('The job ID'),
    format: z.string().optional().describe('Audio format (default: "mp3")'),
  },
  async ({ jobId, format }) => {
    try {
      const assembled = audioStore.getAssembled(jobId);

      if (!assembled) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: 'No assembled audio found. Call assemble_audio first.',
              }),
            },
          ],
        };
      }

      const callbackClient = getClient();
      await callbackClient.uploadAudio(jobId, {
        audioBase64: assembled.audioBase64,
        duration: assembled.totalDuration,
        format: format ?? 'mp3',
      });

      audioStore.clear(jobId);

      return {
        content: [
          { type: 'text' as const, text: JSON.stringify({ success: true, jobId }) },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Audio upload failed',
            }),
          },
        ],
      };
    }
  }
);
