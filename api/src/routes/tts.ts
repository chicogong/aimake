/**
 * Quick TTS Routes
 * POST /api/tts/quick — Direct TTS, no Agent, returns audio buffer
 */

import { Hono } from 'hono';
import type { Env, Variables, QuickTTSRequest } from '../types';
import { createDb } from '../db';
import { TTSService } from '../services/tts';
import { errors } from '../middleware/error';
import { ttsRateLimitMiddleware } from '../middleware/rateLimit';

const ttsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/tts/quick — Quick TTS (sync, returns audio blob)
ttsRouter.post('/quick', ttsRateLimitMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<QuickTTSRequest>();

  if (!body.text || body.text.length === 0) {
    throw errors.validation('文本不能为空');
  }
  if (body.text.length > 5000) {
    throw errors.validation('文本长度不能超过 5000 字符');
  }
  if (!body.voiceId) {
    throw errors.validation('voiceId 不能为空');
  }

  const db = createDb(c.env.DB);
  const ttsService = new TTSService(db, c.env);

  const audioBuffer = await ttsService.generateDirect(user, {
    text: body.text,
    voiceId: body.voiceId,
    speed: body.speed,
    pitch: body.pitch,
    format: body.format,
  });

  const contentType = body.format === 'wav' ? 'audio/wav' : 'audio/mpeg';

  return new Response(audioBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="tts.${body.format || 'mp3'}"`,
    },
  });
});

export default ttsRouter;
