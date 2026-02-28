/**
 * Agent Service entry point
 * Starts the Express HTTP server for content generation.
 */

import 'dotenv/config';
import { createServer } from './server.js';
import { loadConfig } from './types.js';

function main() {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error('Configuration error:', error instanceof Error ? error.message : error);
    console.error('Copy .env.example to .env and fill in the required values.');
    process.exit(1);
  }

  const app = createServer();

  app.listen(config.port, () => {
    console.info(`Agent service running on port ${config.port}`);
    console.info(`LLM model: ${config.llmModel}`);
    console.info(`Workers API: ${config.workersApiUrl}`);
    console.info(`TTS providers: ${[
      config.siliconflowApiKey ? 'SiliconFlow' : null,
    ].filter(Boolean).join(', ') || 'none configured'}`);
  });
}

main();
