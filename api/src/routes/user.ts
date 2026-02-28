/**
 * User Routes
 * GET /api/user/quota - Get user quota
 * GET /api/user/usage - Get usage history
 */

import { Hono } from 'hono';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { createDb, usageLogs } from '../db';
import { success } from '../utils/response';
import { getNextMonthReset } from '../utils/date';

const user = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/user/quota
user.get('/quota', async (c) => {
  const currentUser = c.get('user');
  const db = createDb(c.env.DB);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthStartStr = monthStart.toISOString();

  const [todayUsage] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${usageLogs.durationUsed}), 0)`,
    })
    .from(usageLogs)
    .where(and(eq(usageLogs.userId, currentUser.id), gte(usageLogs.createdAt, todayStr)));

  const [monthUsage] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${usageLogs.durationUsed}), 0)`,
    })
    .from(usageLogs)
    .where(and(eq(usageLogs.userId, currentUser.id), gte(usageLogs.createdAt, monthStartStr)));

  const remaining = Math.max(0, currentUser.quotaLimit - currentUser.quotaUsed);

  return success(c, {
    plan: currentUser.plan,
    quota: {
      limit: currentUser.quotaLimit,
      used: currentUser.quotaUsed,
      remaining,
      resetAt: currentUser.quotaResetAt || getNextMonthReset(),
    },
    usage: {
      today: Math.round(todayUsage?.total || 0),
      thisMonth: Math.round(monthUsage?.total || 0),
    },
  });
});

// GET /api/user/usage
user.get('/usage', async (c) => {
  const currentUser = c.get('user');
  const page = parseInt(c.req.query('page') || '1', 10);
  const pageSize = Math.min(parseInt(c.req.query('pageSize') || '20', 10), 100);
  const startDate = c.req.query('startDate');
  const type = c.req.query('type');

  const db = createDb(c.env.DB);
  const offset = (page - 1) * pageSize;

  const conditions = [eq(usageLogs.userId, currentUser.id)];

  if (startDate) {
    conditions.push(gte(usageLogs.createdAt, startDate));
  }

  if (type) {
    conditions.push(
      eq(usageLogs.type, type as 'tts' | 'podcast' | 'audiobook' | 'voiceover' | 'education')
    );
  }

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usageLogs)
    .where(and(...conditions));

  const total = countResult?.count || 0;

  const records = await db
    .select()
    .from(usageLogs)
    .where(and(...conditions))
    .orderBy(desc(usageLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [summary] = await db
    .select({
      totalChars: sql<number>`COALESCE(SUM(${usageLogs.charsUsed}), 0)`,
      totalDuration: sql<number>`COALESCE(SUM(${usageLogs.durationUsed}), 0)`,
    })
    .from(usageLogs)
    .where(and(...conditions));

  return success(
    c,
    {
      items: records.map((r) => ({
        id: r.id,
        type: r.type,
        jobId: r.jobId,
        characters: r.charsUsed,
        duration: r.durationUsed,
        cost: r.durationUsed,
        provider: r.provider,
        createdAt: r.createdAt,
      })),
      summary: {
        totalCharacters: summary?.totalChars || 0,
        totalDuration: Math.round(summary?.totalDuration || 0),
        totalCost: Math.round(summary?.totalDuration || 0),
      },
    },
    {
      total,
      page,
      pageSize,
    }
  );
});

export default user;
