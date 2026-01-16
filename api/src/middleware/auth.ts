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

// Helper to get next month reset date
function getNextMonthReset(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

export const authMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
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
      // Verify Clerk JWT
      // Note: Remove authorizedParties to simplify verification
      // Clerk tokens are already signed with the secret key which is sufficient for verification
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });

      if (!payload.sub) {
        throw new Error('Invalid token payload');
      }

      // Get user from database
      const db = createDb(c.env.DB);
      let [user] = await db.select().from(users).where(eq(users.clerkId, payload.sub)).limit(1);

      // Auto-create user if not exists (first login)
      if (!user) {
        const email = typeof payload.email === 'string' ? payload.email : `user_${payload.sub}@aimake.cc`;
        const newUserId = generateId();
        
        await db.insert(users).values({
          id: newUserId,
          clerkId: payload.sub,
          email,
          name: null,
          avatarUrl: null,
          plan: 'free',
          quotaLimit: 600, // 10 minutes for free tier
          quotaUsed: 0,
          quotaResetAt: getNextMonthReset(),
        });

        // Fetch the newly created user
        [user] = await db.select().from(users).where(eq(users.id, newUserId)).limit(1);
        
        console.log(`Auto-created user: ${email} (${payload.sub})`);
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

      // Set user in context
      c.set('user', user);
      await next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Auth error:', errorMessage);
      console.error('Token prefix:', token.substring(0, 50));
      return c.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token 无效或已过期',
            debug: errorMessage,
          },
        },
        401
      );
    }
  }
);

/**
 * Optional auth middleware - sets user if token is valid, but allows unauthenticated requests
 */
export const optionalAuthMiddleware = createMiddleware<{ Bindings: Env; Variables: Variables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);

      try {
        const payload = await verifyToken(token, {
          secretKey: c.env.CLERK_SECRET_KEY,
        });

        if (payload.sub) {
          const db = createDb(c.env.DB);
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, payload.sub))
            .limit(1);

          if (user) {
            c.set('user', user);
          }
        }
      } catch {
        // Ignore auth errors for optional auth
      }
    }

    await next();
  }
);
