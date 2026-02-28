/**
 * Tool registry — bundles all custom tools into a single MCP server
 */

import { createSdkMcpServer } from '@tencent-ai/agent-sdk';
import { extractContentTool } from './extract-content.js';
import { generateTtsSegmentTool } from './generate-tts-segment.js';
import { reportProgressTool } from './report-progress.js';
import { saveScriptTool } from './save-script.js';
import { assembleAudioTool } from './assemble-audio.js';
import { uploadAudioTool } from './upload-audio.js';

export function createToolServer() {
  return createSdkMcpServer({
    name: 'voice-tools',
    tools: [
      extractContentTool,
      generateTtsSegmentTool,
      reportProgressTool,
      saveScriptTool,
      assembleAudioTool,
      uploadAudioTool,
    ],
  });
}
