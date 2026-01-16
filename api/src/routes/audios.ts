/**
 * Audio Routes
 * GET /api/audios - List user's audios
 * GET /api/audios/:id - Get audio details
 * DELETE /api/audios/:id - Delete audio
 * GET /api/audios/:id/download - Download audio
 */

import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { createDb, audios, voices } from '../db';
import { success } from '../utils/response';
import { errors } from '../middleware/error';

const audiosRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/audios - List audios with pagination
audiosRouter.get('/', async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '20', 10), 100);
  const type = c.req.query('type'); // 'tts' | 'podcast'
  const _search = c.req.query('search'); // TODO: implement search

  const db = createDb(c.env.DB);
  const offset = (page - 1) * pageSize;

  // Build conditions
  const conditions = [eq(audios.userId, user.id), eq(audios.isDeleted, false)];

  if (type) {
    conditions.push(eq(audios.type, type as 'tts' | 'podcast'));
  }

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(audios)
    .where(and(...conditions));

  const total = countResult?.count || 0;

  // Get audios with voice info
  const result = await db
    .select({
      id: audios.id,
      title: audios.title,
      text: audios.text,
      type: audios.type,
      voiceId: audios.voiceId,
      voiceName: voices.nameZh,
      duration: audios.duration,
      fileSize: audios.fileSize,
      audioUrl: audios.audioUrl,
      createdAt: audios.createdAt,
    })
    .from(audios)
    .leftJoin(voices, eq(audios.voiceId, voices.id))
    .where(and(...conditions))
    .orderBy(desc(audios.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Transform result
  const items = result.map((a) => ({
    id: a.id,
    title: a.title,
    text: a.text ? a.text.substring(0, 100) + (a.text.length > 100 ? '...' : '') : '',
    type: a.type,
    voiceId: a.voiceId,
    voiceName: a.voiceName || '未知音色',
    duration: a.duration,
    size: a.fileSize || 0,
    url: a.audioUrl,
    createdAt: a.createdAt,
  }));

  return success(
    c,
    { items },
    {
      total,
      page,
      pageSize,
    }
  );
});

// GET /api/audios/:id - Get audio details
audiosRouter.get('/:id', async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  const db = createDb(c.env.DB);

  const [audio] = await db
    .select({
      id: audios.id,
      title: audios.title,
      text: audios.text,
      textLength: audios.textLength,
      type: audios.type,
      voiceId: audios.voiceId,
      voiceName: voices.nameZh,
      duration: audios.duration,
      fileSize: audios.fileSize,
      audioUrl: audios.audioUrl,
      audioFormat: audios.audioFormat,
      speed: audios.speed,
      pitch: audios.pitch,
      createdAt: audios.createdAt,
    })
    .from(audios)
    .leftJoin(voices, eq(audios.voiceId, voices.id))
    .where(and(eq(audios.id, id), eq(audios.userId, user.id), eq(audios.isDeleted, false)))
    .limit(1);

  if (!audio) {
    throw errors.notFound('音频不存在');
  }

  return success(c, {
    id: audio.id,
    title: audio.title,
    text: audio.text,
    type: audio.type,
    voiceId: audio.voiceId,
    voiceName: audio.voiceName || '未知音色',
    duration: audio.duration,
    size: audio.fileSize || 0,
    url: audio.audioUrl,
    settings: {
      speed: audio.speed,
      pitch: audio.pitch,
      format: audio.audioFormat,
    },
    usage: {
      characters: audio.textLength,
      cost: audio.duration, // Cost in seconds
    },
    createdAt: audio.createdAt,
  });
});

// DELETE /api/audios/:id - Soft delete audio
audiosRouter.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  const db = createDb(c.env.DB);

  await db
    .update(audios)
    .set({
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(audios.id, id), eq(audios.userId, user.id)));

  return success(c, { deleted: true });
});

// GET /api/audios/:id/download - Download audio file
audiosRouter.get('/:id/download', async (c) => {
  const { id } = c.req.param();
  const user = c.get('user');

  const db = createDb(c.env.DB);

  const [audio] = await db
    .select()
    .from(audios)
    .where(and(eq(audios.id, id), eq(audios.userId, user.id), eq(audios.isDeleted, false)))
    .limit(1);

  if (!audio) {
    throw errors.notFound('音频不存在');
  }

  // Check if R2 is configured
  if (!c.env.R2) {
    // If R2 is not available, redirect to stored URL
    if (audio.audioUrl) {
      return c.redirect(audio.audioUrl);
    }
    throw errors.internal('存储服务未配置');
  }

  // Get file from R2
  const filename = `${user.id}/${id}.${audio.audioFormat}`;
  const object = await c.env.R2.get(filename);

  if (!object) {
    throw errors.notFound('音频文件不存在');
  }

  const contentType = audio.audioFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav';
  const downloadName = `${audio.title || 'audio'}.${audio.audioFormat}`;

  return new Response(object.body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadName)}"`,
      'Content-Length': String(audio.fileSize || object.size),
    },
  });
});

export default audiosRouter;
