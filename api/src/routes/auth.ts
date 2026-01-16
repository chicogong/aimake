/**
 * Auth Routes
 * GET /api/auth/me - Get current user
 * POST /api/webhook/clerk - Clerk webhook handler
 */

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { createDb, users } from '../db';
import { generateId } from '../utils/id';
import { success } from '../utils/response';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/auth/me - Get current user info
auth.get('/me', (c) => {
  const user = c.get('user');

  // Calculate remaining quota
  const remaining = Math.max(0, user.quotaLimit - user.quotaUsed);

  return success(c, {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    plan: user.plan,
    quota: {
      limit: user.quotaLimit,
      used: user.quotaUsed,
      remaining,
      resetAt: user.quotaResetAt || getNextMonthReset(),
    },
    createdAt: user.createdAt,
  });
});

// Helper to get next month reset date
function getNextMonthReset(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

export default auth;

// ============ Clerk Webhook Handler ============
// This is exported separately to be mounted at /api/webhook/clerk

export const clerkWebhook = new Hono<{ Bindings: Env; Variables: Variables }>();

clerkWebhook.post('/clerk', async (c) => {
  // Verify webhook signature (Svix)
  const svixId = c.req.header('svix-id');
  const svixTimestamp = c.req.header('svix-timestamp');
  const svixSignature = c.req.header('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return c.json({ success: false, error: 'Missing webhook headers' }, 400);
  }

  // TODO: Verify signature with @svix/node in production
  // For now, we'll process the webhook

  const body = await c.req.json<{
    type: string;
    data: {
      id: string;
      email_addresses?: Array<{ email_address: string }>;
      first_name?: string | null;
      last_name?: string | null;
      image_url?: string | null;
    };
  }>();

  const db = createDb(c.env.DB);

  try {
    switch (body.type) {
      case 'user.created': {
        const email = body.data.email_addresses?.[0]?.email_address;
        if (!email) {
          return c.json({ success: false, error: 'No email' }, 400);
        }

        const name = [body.data.first_name, body.data.last_name].filter(Boolean).join(' ') || null;

        await db.insert(users).values({
          id: generateId(),
          clerkId: body.data.id,
          email,
          name,
          avatarUrl: body.data.image_url || null,
          plan: 'free',
          quotaLimit: 600, // 10 minutes for free tier
          quotaUsed: 0,
          quotaResetAt: getNextMonthReset(),
        });

        console.log(`User created: ${email}`);
        break;
      }

      case 'user.updated': {
        const email = body.data.email_addresses?.[0]?.email_address;
        const name = [body.data.first_name, body.data.last_name].filter(Boolean).join(' ') || null;

        await db
          .update(users)
          .set({
            email: email || undefined,
            name,
            avatarUrl: body.data.image_url || null,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.clerkId, body.data.id));

        console.log(`User updated: ${body.data.id}`);
        break;
      }

      case 'user.deleted': {
        await db.delete(users).where(eq(users.clerkId, body.data.id));

        console.log(`User deleted: ${body.data.id}`);
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${body.type}`);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ success: false, error: 'Internal error' }, 500);
  }
});
