/**
 * report_progress tool
 * Sends progress updates to the Workers API via HTTP callback.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { CallbackClient } from '../utils/callback-client.js';

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

export const reportProgressTool = tool(
  'report_progress',
  'Report the current progress of content generation to the backend. ' +
    'Call this after completing each major stage: classifying, extracting, analyzing, scripting, synthesizing, assembling. ' +
    'Also call with stage "failed" if an error occurs, or "completed" when done.',
  {
    jobId: z.string().describe('The job ID'),
    stage: z
      .enum([
        'classifying',
        'extracting',
        'analyzing',
        'scripting',
        'synthesizing',
        'assembling',
        'completed',
        'failed',
      ])
      .describe('Current pipeline stage'),
    progress: z
      .number()
      .int()
      .min(0)
      .max(100)
      .describe('Progress percentage (0-100)'),
    message: z.string().optional().describe('Optional status message or error detail'),
    detectedContentType: z.string().optional().describe('Content type detected during classify stage'),
  },
  async ({ jobId, stage, progress, message, detectedContentType }) => {
    try {
      const callbackClient = getClient();
      await callbackClient.updateProgress(jobId, {
        status: stage,
        progress,
        currentStage: stage,
        detectedContentType,
        ...(stage === 'failed' && message
          ? { errorCode: 'GENERATION_FAILED', errorMessage: message }
          : {}),
      });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ success: true }) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Progress update failed',
            }),
          },
        ],
      };
    }
  }
);
