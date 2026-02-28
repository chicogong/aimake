/**
 * save_script tool
 * Persists the generated script to the database via HTTP callback.
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

export const saveScriptTool = tool(
  'save_script',
  'Save the generated script to the database. ' +
    'Call this after generating the complete script and before starting TTS synthesis. ' +
    'The script should be a JSON string with title, segments array, and estimatedDuration.',
  {
    jobId: z.string().describe('The job ID'),
    script: z.string().describe('JSON string of the script'),
    title: z.string().optional().describe('Generated title for the content'),
  },
  async ({ jobId, script, title }) => {
    try {
      JSON.parse(script);

      const callbackClient = getClient();
      await callbackClient.saveScript(jobId, { script, title });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ success: true }) }],
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ success: false, error: 'Invalid JSON in script' }),
            },
          ],
        };
      }
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Script save failed',
            }),
          },
        ],
      };
    }
  }
);
