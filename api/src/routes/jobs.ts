/**
 * Jobs Routes — Unified content generation
 * POST   /api/jobs           — Create a generation job
 * GET    /api/jobs            — List jobs (paginated)
 * GET    /api/jobs/:id        — Job detail
 * GET    /api/jobs/:id/stream — SSE progress stream
 * DELETE /api/jobs/:id        — Soft delete
 * GET    /api/jobs/:id/download — Download audio
 */

import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { eq, and, desc, sql, ne } from 'drizzle-orm';
import type { Env, Variables, CreateJobRequest, JobResponse, ContentType } from '../types';
import { createDb, jobs } from '../db';
import { generateId, generateShortId } from '../utils/id';
import { success, created } from '../utils/response';
import { errors } from '../middleware/error';

const jobsRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/jobs — Create a generation job
jobsRouter.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json<CreateJobRequest>();

  // Validation
  if (!body.source?.content) {
    throw errors.validation('source.content 不能为空');
  }
  if (!body.source?.type) {
    throw errors.validation('source.type 不能为空');
  }
  if (!body.contentType) {
    throw errors.validation('contentType 不能为空');
  }

  // Resolve content type
  const contentType: ContentType = body.contentType === 'auto' ? 'podcast' : body.contentType;

  const db = createDb(c.env.DB);
  const jobId = generateId();
  const streamToken = generateShortId() + generateShortId();
  const now = new Date().toISOString();

  await db.insert(jobs).values({
    id: jobId,
    userId: user.id,
    title: body.title || null,
    contentType,
    sourceType: body.source.type,
    sourceContent: body.source.content,
    settings: JSON.stringify(body.settings || {}),
    status: 'pending',
    progress: 0,
    streamToken,
    isQuickTts: false,
    createdAt: now,
    updatedAt: now,
  });

  // Fire-and-forget: dispatch to agent service
  if (c.env.AGENT_SERVICE_URL && c.env.INTERNAL_API_SECRET) {
    const agentPayload = {
      jobId,
      source: body.source,
      contentType: body.contentType, // Pass 'auto' so agent can classify
      settings: {
        ...body.settings,
        episodeDuration: body.settings.duration,
      },
      title: body.title,
      callbackUrl: '', // Agent uses WORKERS_API_URL env var
    };

    fetch(`${c.env.AGENT_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': c.env.INTERNAL_API_SECRET,
      },
      body: JSON.stringify(agentPayload),
    }).catch((err) => {
      console.error(`Failed to dispatch job ${jobId} to agent:`, err);
    });
  }

  return created(c, {
    id: jobId,
    status: 'pending',
    streamToken,
  });
});

// GET /api/jobs — List jobs
jobsRouter.get('/', async (c) => {
  const user = c.get('user');
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '20', 10), 100);
  const contentType = c.req.query('contentType') as ContentType | undefined;
  const offset = (page - 1) * pageSize;

  const db = createDb(c.env.DB);

  const conditions = [eq(jobs.userId, user.id), ne(jobs.isDeleted, true)];

  if (contentType) {
    conditions.push(eq(jobs.contentType, contentType));
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(and(...conditions));

  const total = countResult?.count || 0;

  const records = await db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const items: JobResponse[] = records.map(jobToResponse);

  return success(c, items, { total, page, pageSize });
});

// GET /api/jobs/:id — Job detail
jobsRouter.get('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const db = createDb(c.env.DB);
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, user.id)))
    .limit(1);

  if (!job) {
    throw errors.notFound('任务不存在');
  }

  return success(c, {
    ...jobToResponse(job),
    sourceContent: job.sourceContent,
    settings: job.settings,
    script: job.script,
    detectedContentType: job.detectedContentType,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  });
});

// SSE stream router — mounted as public route (no auth required, uses stream token)
export const jobsStreamRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

jobsStreamRouter.get('/:id/stream', async (c) => {
  const { id } = c.req.param();
  const token = c.req.query('token');

  const db = createDb(c.env.DB);

  // Verify stream token
  const [job] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

  if (!job || job.streamToken !== token) {
    throw errors.unauthorized('Invalid stream token');
  }

  return streamSSE(c, async (stream) => {
    let lastStatus = '';
    let lastProgress = -1;
    let lastScript = '';
    let attempts = 0;
    const maxAttempts = 600; // 10 minutes max

    while (attempts < maxAttempts) {
      const [current] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);

      if (!current) break;

      // Send update if something changed
      if (current.status !== lastStatus || current.progress !== lastProgress) {
        lastStatus = current.status;
        lastProgress = current.progress ?? 0;

        if (current.status === 'completed') {
          await stream.writeSSE({
            event: 'complete',
            data: JSON.stringify({
              type: 'complete',
              audioUrl: current.audioUrl,
              duration: current.duration,
              fileSize: current.fileSize,
            }),
          });
          break;
        }

        if (current.status === 'failed') {
          await stream.writeSSE({
            event: 'error',
            data: JSON.stringify({
              type: 'error',
              code: current.errorCode || 'JOB_ERROR',
              message: current.errorMessage || '生成失败',
            }),
          });
          break;
        }

        await stream.writeSSE({
          event: 'progress',
          data: JSON.stringify({
            type: 'progress',
            status: current.status,
            progress: current.progress,
            currentStage: current.currentStage,
          }),
        });
      }

      // Send script if it changed
      if (current.script && current.script !== lastScript) {
        lastScript = current.script;
        await stream.writeSSE({
          event: 'script_update',
          data: JSON.stringify({
            type: 'script_update',
            script: current.script,
          }),
        });
      }

      attempts++;
      await stream.sleep(1000);
    }
  });
});

// DELETE /api/jobs/:id — Soft delete
jobsRouter.delete('/:id', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const db = createDb(c.env.DB);

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, user.id)))
    .limit(1);

  if (!job) {
    throw errors.notFound('任务不存在');
  }

  await db
    .update(jobs)
    .set({ isDeleted: true, updatedAt: new Date().toISOString() })
    .where(eq(jobs.id, id));

  return success(c, { deleted: true });
});

// GET /api/jobs/:id/download — Download audio
jobsRouter.get('/:id/download', async (c) => {
  const user = c.get('user');
  const { id } = c.req.param();

  const db = createDb(c.env.DB);
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, user.id)))
    .limit(1);

  if (!job || !job.audioUrl) {
    throw errors.notFound('音频不存在');
  }

  // R2 key stored in audioUrl
  if (c.env.R2 && !job.audioUrl.startsWith('kv://')) {
    const object = await c.env.R2.get(job.audioUrl);
    if (!object) {
      throw errors.notFound('音频文件不存在');
    }

    const contentType = job.audioFormat === 'wav' ? 'audio/wav' : 'audio/mpeg';
    const filename = `${job.title || 'audio'}.${job.audioFormat || 'mp3'}`;

    return new Response(object.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  }

  // KV fallback
  if (job.audioUrl.startsWith('kv://')) {
    const kvKey = job.audioUrl.replace('kv://', '');
    const audioData = await c.env.KV.get(kvKey);
    if (!audioData) {
      throw errors.notFound('音频文件已过期');
    }

    const audioBuffer = Uint8Array.from(atob(audioData), (ch) => ch.charCodeAt(0));
    const contentType = job.audioFormat === 'wav' ? 'audio/wav' : 'audio/mpeg';

    return new Response(audioBuffer.buffer, {
      headers: {
        'Content-Type': contentType,
      },
    });
  }

  throw errors.notFound('无法获取音频');
});

// ============ Helpers ============

function jobToResponse(job: typeof jobs.$inferSelect): JobResponse {
  const response: JobResponse = {
    id: job.id,
    title: job.title,
    contentType: job.contentType as ContentType,
    sourceType: job.sourceType as 'text' | 'url' | 'document',
    status: job.status as JobResponse['status'],
    progress: job.progress ?? 0,
    currentStage: job.currentStage,
    audioUrl: job.audioUrl,
    audioFormat: job.audioFormat,
    duration: job.duration,
    fileSize: job.fileSize,
    streamToken: job.streamToken,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };

  if (job.status === 'failed' && (job.errorCode || job.errorMessage)) {
    response.error = {
      code: job.errorCode || 'JOB_ERROR',
      message: job.errorMessage || '生成失败',
    };
  }

  return response;
}

export default jobsRouter;
