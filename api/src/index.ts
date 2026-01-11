/**
 * AIMake API
 * Cloudflare Workers + Hono
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';

import type { Env, Variables } from './types';
import { errorHandler } from './middleware/error';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';

// Routes
import healthRoutes from './routes/health';
import authRoutes, { clerkWebhook } from './routes/auth';
import voicesRoutes from './routes/voices';
import ttsRoutes from './routes/tts';
import audiosRoutes from './routes/audios';
import userRoutes from './routes/user';

// Create app
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ============ Global Middleware ============

// Logging
app.use('*', logger());

// Timing headers
app.use('*', timing());

// Security headers
app.use('*', secureHeaders());

// CORS
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      if (!origin) return null;
      
      // Allow configured origins (comma-separated)
      const allowed = c.env.CORS_ORIGIN?.split(',').map((s: string) => s.trim()) || [];
      if (allowed.includes(origin)) return origin;

      // Allow localhost in development
      if (origin.startsWith('http://localhost:')) return origin;

      // Allow production domains
      if (origin === 'https://aimake.cc' || origin === 'https://app.aimake.cc') {
        return origin;
      }
      
      // Allow Cloudflare Pages preview URLs
      if (origin.includes('.aimake-app.pages.dev')) {
        return origin;
      }

      return null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Error handler
app.onError(errorHandler);

// ============ Public Routes ============

// Health check
app.route('/api/health', healthRoutes);

// Voices (public, no auth needed)
app.route('/api/voices', voicesRoutes);

// Webhooks (no auth, verified by signature)
app.route('/api/webhook', clerkWebhook);

// ============ Protected Routes ============

// Apply auth middleware to all /api/* routes below
app.use('/api/*', authMiddleware);

// Apply rate limiting
app.use('/api/*', rateLimitMiddleware());

// Auth routes
app.route('/api/auth', authRoutes);

// TTS routes
app.route('/api/tts', ttsRoutes);

// Audio routes
app.route('/api/audios', audiosRoutes);

// User routes
app.route('/api/user', userRoutes);

// ============ Fallback ============

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'API endpoint not found',
      },
    },
    404
  );
});

// ============ Export ============

export default app;
