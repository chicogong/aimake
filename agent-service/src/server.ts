/**
 * Express server with HTTP endpoints for content generation.
 * Called by the Cloudflare Workers API.
 */

import express from 'express';
import { startGeneration, isGenerating } from './agent/voice-agent.js';
import { GenerateRequestSchema } from './types.js';
import { getServiceConfig } from './utils/shared-clients.js';

export function createServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'agent-service' });
  });

  // Start content generation
  app.post('/generate', (req, res) => {
    const secret = req.headers['x-internal-secret'];
    if (secret !== getServiceConfig().internalApiSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const result = GenerateRequestSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Invalid request payload',
        details: result.error.format(),
      });
      return;
    }

    const body = result.data;

    if (isGenerating(body.jobId)) {
      res.status(409).json({ error: 'Generation already in progress for this job' });
      return;
    }

    startGeneration(body);

    res.status(202).json({
      accepted: true,
      jobId: body.jobId,
      message: 'Content generation started',
    });
  });

  // Check if a specific job is being generated
  app.get('/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    res.json({
      jobId,
      generating: isGenerating(jobId),
    });
  });

  return app;
}
