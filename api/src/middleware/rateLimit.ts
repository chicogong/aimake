/**
 * Rate Limiting Middleware
 * Uses Cloudflare KV for distributed rate limiting
 */

import { createMiddleware } from 'hono/factory';
import type { Env, Variables } from '../types';

interface RateLimitConfig {
  limit: number; // Max requests
  window: number; // Time window in seconds
  keyPrefix?: string;
}

const defaultConfig: RateLimitConfig = {
  limit: 60, // 60 requests
  window: 60, // per minute
  keyPrefix: 'ratelimit',
};

export const rateLimitMiddleware = (config: Partial<RateLimitConfig> = {}) => {
  const { limit, window, keyPrefix } = { ...defaultConfig, ...config };

  return createMiddleware<{ Bindings: Env; Variables: Variables }>(async (c, next) => {
    const user = c.get('user');
    const identifier = user?.id || c.req.header('CF-Connecting-IP') || 'anonymous';
    const key = `${keyPrefix}:${identifier}`;

    try {
      // Get current count from KV
      const current = await c.env.KV.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= limit) {
        return c.json(
          {
            success: false,
            error: {
              code: 'RATE_LIMITED',
              message: '请求过于频繁，请稍后再试',
            },
          },
          429
        );
      }

      // Increment count
      await c.env.KV.put(key, String(count + 1), {
        expirationTtl: window,
      });

      // Add rate limit headers
      c.header('X-RateLimit-Limit', String(limit));
      c.header('X-RateLimit-Remaining', String(Math.max(0, limit - count - 1)));
      c.header('X-RateLimit-Reset', String(Math.floor(Date.now() / 1000) + window));

      await next();
    } catch (error) {
      // On KV error, allow the request but log the error
      console.error('Rate limit KV error:', error);
      await next();
    }
  });
};

// Stricter rate limit for expensive operations like TTS
export const ttsRateLimitMiddleware = rateLimitMiddleware({
  limit: 10, // 10 TTS requests
  window: 60, // per minute
  keyPrefix: 'ratelimit:tts',
});
