/**
 * TTS Routes
 * POST /api/tts/generate - Generate audio
 * GET /api/tts/status/:jobId - Get job status
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../types';
import { createDb } from '../db';
import { TTSService } from '../services/tts';
import { success } from '../utils/response';
import { ttsRateLimitMiddleware } from '../middleware/rateLimit';

const tts = new Hono<{ Bindings: Env; Variables: Variables }>();

// Validation schema
const generateSchema = z.object({
  text: z
    .string()
    .min(1, '请输入文本')
    .max(5000, '文本长度不能超过 5000 字符'),
  voiceId: z.string().min(1, '请选择音色'),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(-10).max(10).default(0),
  format: z.enum(['mp3', 'wav']).default('mp3'),
});

// POST /api/tts/generate
tts.post('/generate', ttsRateLimitMiddleware, zValidator('json', generateSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const db = createDb(c.env.DB);
  const ttsService = new TTSService(db, c.env);

  const result = await ttsService.createJob(user, body);

  return success(c, result);
});

// GET /api/tts/status/:jobId
tts.get('/status/:jobId', async (c) => {
  const { jobId } = c.req.param();
  const user = c.get('user');

  const db = createDb(c.env.DB);
  const ttsService = new TTSService(db, c.env);

  const result = await ttsService.getJobStatus(jobId, user.id);

  return success(c, result);
});

export default tts;
