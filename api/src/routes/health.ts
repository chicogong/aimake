/**
 * Health Check Routes
 * GET /api/health
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../types';

const health = new Hono<{ Bindings: Env; Variables: Variables }>();

health.get('/', async (c) => {
  const start = Date.now();

  // Check database
  let dbStatus: 'connected' | 'error' = 'error';
  try {
    await c.env.DB.prepare('SELECT 1').first();
    dbStatus = 'connected';
  } catch (e) {
    console.error('DB health check failed:', e);
  }

  // Check KV
  let kvStatus: 'connected' | 'error' = 'error';
  try {
    await c.env.KV.get('health-check');
    kvStatus = 'connected';
  } catch (e) {
    console.error('KV health check failed:', e);
  }

  // Check R2
  let r2Status: 'connected' | 'error' | 'not_configured' = 'not_configured';
  if (c.env.R2) {
    try {
      await c.env.R2.head('health-check');
      r2Status = 'connected';
    } catch (e) {
      // R2.head returns null for non-existent objects, which is fine
      if (e instanceof Error && !e.message.includes('not found')) {
        console.error('R2 health check failed:', e);
        r2Status = 'error';
      } else {
        r2Status = 'connected';
      }
    }
  }

  const latency = Date.now() - start;
  const allServicesHealthy = dbStatus === 'connected' && kvStatus === 'connected';

  return c.json({
    success: true,
    data: {
      status: allServicesHealthy ? 'ok' : 'degraded',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      latency: `${latency}ms`,
      services: {
        database: dbStatus,
        kv: kvStatus,
        r2: r2Status,
      },
      environment: c.env.ENVIRONMENT,
    },
  });
});

export default health;
