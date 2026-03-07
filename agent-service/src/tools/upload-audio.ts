/**
 * upload_audio tool
 * Reads the assembled audio from AudioStore and uploads it.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { getCallbackClient } from '../utils/shared-clients.js';
import { audioStore } from '../utils/audio-store.js';
import { toolSuccess, toolError } from './tool-helpers.js';

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
        return toolError('No assembled audio found. Call assemble_audio first.');
      }

      const callbackClient = getCallbackClient();
      await callbackClient.uploadAudio(jobId, {
        audioBase64: assembled.audioBase64,
        duration: assembled.totalDuration,
        format: format ?? 'mp3',
      });

      audioStore.clear(jobId);

      return toolSuccess({ jobId });
    } catch (error) {
      return toolError(error instanceof Error ? error.message : 'Audio upload failed');
    }
  }
);
