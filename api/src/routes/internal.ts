/**
 * Internal Routes — callbacks from the agent service
 * Secured by X-Internal-Secret header (not Clerk auth).
 * Mounted BEFORE auth middleware (public route section).
 *
 * POST /api/internal/jobs/:id/progress — Update generation progress
 * POST /api/internal/jobs/:id/script   — Save generated script
 * POST /api/internal/jobs/:id/audio    — Upload and store final audio
 */

import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import type { Env, Variables, ProgressCallbackPayload, ScriptCallbackPayload, AudioCallbackPayload } from '../types';
import { createDb } from '../db';
import { jobs, users, usageLogs } from '../db/schema';
import { generateId } from '../utils/id';

const internalRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============ Secret verification middleware ============

internalRoutes.use('*', async (c, next) => {
  const secret = c.req.header('X-Internal-Secret');
  if (!c.env.INTERNAL_API_SECRET || secret !== c.env.INTERNAL_API_SECRET) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  await next();
});

// ============ Progress Update ============

internalRoutes.post('/jobs/:id/progress', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<ProgressCallbackPayload>();

  const db = createDb(c.env.DB);

  const updateData: Record<string, unknown> = {
    status: body.status,
    progress: body.progress,
    currentStage: body.currentStage,
    errorCode: body.errorCode || null,
    errorMessage: body.errorMessage || null,
    updatedAt: new Date().toISOString(),
  };

  if (body.detectedContentType) {
    updateData.detectedContentType = body.detectedContentType;
  }

  if (body.status !== 'pending' && body.status !== 'failed') {
    // Set startedAt on first non-pending status
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
    if (job && !job.startedAt) {
      updateData.startedAt = new Date().toISOString();
    }
  }

  await db
    .update(jobs)
    .set(updateData)
    .where(eq(jobs.id, id));

  return c.json({ success: true });
});

// ============ Script Save ============

internalRoutes.post('/jobs/:id/script', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<ScriptCallbackPayload>();

  const db = createDb(c.env.DB);

  const updateData: Record<string, unknown> = {
    script: body.script,
    updatedAt: new Date().toISOString(),
  };

  if (body.title) {
    updateData.title = body.title;
  }

  await db
    .update(jobs)
    .set(updateData)
    .where(eq(jobs.id, id));

  return c.json({ success: true });
});

// ============ Audio Upload ============

internalRoutes.post('/jobs/:id/audio', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json<AudioCallbackPayload>();

  const db = createDb(c.env.DB);

  const audioBuffer = Uint8Array.from(atob(body.audioBase64), (ch) => ch.charCodeAt(0));

  let audioUrl: string;

  if (c.env.R2) {
    const key = `jobs/${id}.${body.format}`;
    await c.env.R2.put(key, audioBuffer.buffer, {
      httpMetadata: {
        contentType: body.format === 'mp3' ? 'audio/mpeg' : 'audio/wav',
      },
    });
    audioUrl = key;
  } else {
    const kvKey = `job-audio:${id}`;
    await c.env.KV.put(kvKey, body.audioBase64, {
      metadata: { format: body.format, duration: body.duration },
    });
    audioUrl = `kv://${kvKey}`;
  }

  const now = new Date().toISOString();

  // Update job record
  await db
    .update(jobs)
    .set({
      audioUrl,
      audioFormat: body.format,
      duration: body.duration,
      fileSize: audioBuffer.byteLength,
      status: 'completed',
      progress: 100,
      currentStage: 'completed',
      completedAt: now,
      updatedAt: now,
    })
    .where(eq(jobs.id, id));

  // Log usage
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (job) {
    await db.insert(usageLogs).values({
      id: generateId(),
      userId: job.userId,
      type: job.contentType as 'tts' | 'podcast' | 'audiobook' | 'voiceover' | 'education',
      charsUsed: job.sourceContent.length,
      durationUsed: body.duration,
      jobId: id,
      provider: 'agent',
      createdAt: now,
    });

    // Update user quota
    await db
      .update(users)
      .set({
        quotaUsed: sql`${users.quotaUsed} + ${Math.ceil(body.duration)}`,
        updatedAt: now,
      })
      .where(eq(users.id, job.userId));
  }

  return c.json({ success: true, audioUrl });
});

export default internalRoutes;
