/**
 * Authentication Middleware
 * Verifies Clerk JWT tokens
 */

import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import { eq } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { createDb, users } from '../db';

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
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });

      if (!payload.sub) {
        throw new Error('Invalid token payload');
      }

      // Get user from database
      const db = createDb(c.env.DB);
      const [user] = await db.select().from(users).where(eq(users.clerkId, payload.sub)).limit(1);

      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: '用户不存在',
            },
          },
          404
        );
      }

      // Set user in context
      c.set('user', user);
      await next();
    } catch (error) {
      console.error('Auth error:', error);
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
