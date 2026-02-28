/**
 * Express server with HTTP endpoints for content generation.
 * Called by the Cloudflare Workers API.
 */

import express from 'express';
import { startGeneration, isGenerating } from './agent/voice-agent.js';
import type { GenerateRequest } from './types.js';

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
    if (secret !== process.env.INTERNAL_API_SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const body = req.body as GenerateRequest;

    if (!body.jobId || !body.source || !body.settings) {
      res.status(400).json({ error: 'Missing required fields: jobId, source, settings' });
      return;
    }

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
