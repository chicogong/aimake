/**
 * Authentication Middleware
 * Verifies Clerk JWT tokens
 */

import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { createDb, users } from '../db';
import { generateId } from '../utils/id';
import { getNextMonthReset } from '../utils/date';

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    if (c.env.ENVIRONMENT === 'development' && c.req.header('X-Dev-Bypass') === 'true') {
      const db = createDb(c.env.DB);
      const devEmail = 'dev@aimake.cc';
      const devClerkId = 'dev_local_user';

      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, devClerkId))
        .limit(1);

      if (!user) {
        const newUserId = generateId();
        await db.insert(users).values({
          id: newUserId,
          clerkId: devClerkId,
          email: devEmail,
          name: 'Dev User',
          avatarUrl: null,
          plan: 'free',
          quotaLimit: 600,
          quotaUsed: 0,
          quotaResetAt: getNextMonthReset(),
        });
        [user] = await db.select().from(users).where(eq(users.id, newUserId)).limit(1);
      }

      if (user) {
        c.set('user', user);
        console.warn('[DEV] Auth bypassed for local development');
        await next();
        return;
      }
    }

    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '请先登录',
          },
        },
        401
      );
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });

      if (!payload.sub) {
        throw new Error('Invalid token payload');
      }

      const db = createDb(c.env.DB);
      let [user] = await db.select().from(users).where(eq(users.clerkId, payload.sub)).limit(1);

      if (!user) {
        const email =
          typeof payload.email === 'string' ? payload.email : `user_${payload.sub}@aimake.cc`;
        const newUserId = generateId();

        await db.insert(users).values({
          id: newUserId,
          clerkId: payload.sub,
          email,
          name: null,
          avatarUrl: null,
          plan: 'free',
          quotaLimit: 600,
          quotaUsed: 0,
          quotaResetAt: getNextMonthReset(),
        });

        [user] = await db.select().from(users).where(eq(users.id, newUserId)).limit(1);
      }

      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: '用户创建失败',
            },
          },
          500
        );
      }

      c.set('user', user);
      await next();
    } catch (error) {
      console.error('Auth error:', error instanceof Error ? error.message : String(error));
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token 无效或已过期',
          },
        },
        401
      );
    }
  }
);
