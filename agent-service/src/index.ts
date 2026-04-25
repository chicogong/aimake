/**
 * Agent Service entry point
 * Starts the Express HTTP server for content generation.
 *
 * R2: Graceful shutdown — marks active jobs as failed on SIGTERM/SIGINT.
 */

import 'dotenv/config';
import { createServer } from './server.js';
import { loadConfig } from './types.js';
import { markAllJobsFailed } from './agent/voice-agent.js';
import { initSharedClients } from './utils/shared-clients.js';
import { audioStore } from './utils/audio-store.js';

function main() {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error('Configuration error:', error instanceof Error ? error.message : error);
    console.error('Copy .env.example to .env and fill in the required values.');
    process.exit(1);
  }

  initSharedClients(config);
  audioStore.startSweeper();

  const app = createServer();

  const server = app.listen(config.port, () => {
    console.info(`Agent service running on port ${config.port}`);
    console.info(`LLM model: ${config.llmModel}`);
    console.info(`Workers API: ${config.workersApiUrl}`);
    console.info(`TTS providers: ${[
      config.siliconflowApiKey ? 'SiliconFlow' : null,
    ].filter(Boolean).join(', ') || 'none configured'}`);
  });

  // Graceful shutdown
  let shuttingDown = false;

  async function handleShutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.info(`Received ${signal}, shutting down gracefully...`);

    // Stop accepting new connections
    server.close();
    audioStore.stopSweeper();

    // Mark all active jobs as failed
    try {
      await markAllJobsFailed(`Service shutdown (${signal})`);
    } catch (error) {
      console.error('Error during shutdown cleanup:', error);
    }

    console.info('Shutdown complete.');
    process.exit(0);
  }

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}

main();
