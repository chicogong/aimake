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
import { z } from 'zod';
import type { Env, Variables } from '../types';
import { createDb } from '../db';
import { jobs, users, usageLogs } from '../db/schema';
import { generateId } from '../utils/id';

const internalRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============ Zod Schemas ============

const JobStatusEnum = z.enum([
  'pending',
  'classifying',
  'extracting',
  'analyzing',
  'scripting',
  'synthesizing',
  'assembling',
  'completed',
  'failed',
]);

const ProgressSchema = z.object({
  status: JobStatusEnum,
  progress: z.number().min(0).max(100),
  currentStage: z.string().min(1).max(50),
  detectedContentType: z.string().max(50).optional(),
  errorCode: z.string().max(100).optional(),
  errorMessage: z.string().max(1000).optional(),
});

const ScriptSchema = z.object({
  script: z.string().min(1).max(500000), // 500KB max
  title: z.string().max(200).optional(),
});

const AudioSchema = z.object({
  audioBase64: z.string().min(1),
  duration: z.number().min(0).max(7200), // max 2 hours
  format: z.enum(['mp3', 'wav']),
});

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
  const raw = await c.req.json();

  const parsed = ProgressSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid payload', details: parsed.error.format() }, 400);
  }

  const body = parsed.data;
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
  const raw = await c.req.json();

  const parsed = ScriptSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid payload', details: parsed.error.format() }, 400);
  }

  const body = parsed.data;
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
  const raw = await c.req.json();

  const parsed = AudioSchema.safeParse(raw);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid payload', details: parsed.error.format() }, 400);
  }

  const body = parsed.data;
  const db = createDb(c.env.DB);

  let audioBuffer: Uint8Array;
  try {
    audioBuffer = Uint8Array.from(atob(body.audioBase64), (ch) => ch.charCodeAt(0));
  } catch {
    return c.json({ success: false, error: 'Invalid base64 audio data' }, 400);
  }

  let audioUrl: string;

  if (c.env.R2) {
    const key = `jobs/${id}.${body.format}`;
    await c.env.R2.put(key, audioBuffer.buffer as ArrayBuffer, {
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
