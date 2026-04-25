/**
 * save_script tool
 * Persists the generated script to the database via HTTP callback.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';
import { getCallbackClient } from '../utils/shared-clients.js';
import { toolSuccess, toolError, withErrorHandling } from './tool-helpers.js';

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
  ({ jobId, script, title }) =>
    withErrorHandling(async () => {
      try {
        JSON.parse(script);
      } catch {
        return toolError('Invalid JSON in script');
      }
      await getCallbackClient().saveScript(jobId, { script, title });
      return toolSuccess();
    }, 'Script save failed')
);
