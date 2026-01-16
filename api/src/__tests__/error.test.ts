import { describe, it, expect } from 'vitest';
import { AppError, errors } from '../middleware/error';

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const err = new AppError('BAD_REQUEST', 400, 'Test error');

    expect(err.code).toBe('BAD_REQUEST');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Test error');
    expect(err instanceof Error).toBe(true);
  });

  it('inherits from Error', () => {
    const err = new AppError('INTERNAL_ERROR', 500, 'Internal error');

    expect(err instanceof Error).toBe(true);
    expect(err.name).toBe('AppError');
  });

  it('can include details', () => {
    const details = { field: 'email', reason: 'invalid format' };
    const err = new AppError('VALIDATION_ERROR', 400, 'Invalid input', details);

    expect(err.details).toEqual(details);
  });
});

describe('Error Factory Functions', () => {
  it('errors.badRequest creates 400 error', () => {
    const err = errors.badRequest('Invalid input');

    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('Invalid input');
  });

  it('errors.unauthorized creates 401 error', () => {
    const err = errors.unauthorized('Not authenticated');

    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('Not authenticated');
  });

  it('errors.unauthorized uses default message', () => {
    const err = errors.unauthorized();

    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('请先登录');
  });

  it('errors.forbidden creates 403 error', () => {
    const err = errors.forbidden('Access denied');

    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.message).toBe('Access denied');
  });

  it('errors.notFound creates 404 error', () => {
    const err = errors.notFound('Resource not found');

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Resource not found');
  });

  it('errors.validation creates 400 error with VALIDATION_ERROR code', () => {
    const err = errors.validation('Invalid data');

    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.message).toBe('Invalid data');
  });

  it('errors.quotaExceeded creates 403 error with QUOTA_EXCEEDED code', () => {
    const err = errors.quotaExceeded('Quota exceeded');

    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('QUOTA_EXCEEDED');
    expect(err.message).toBe('Quota exceeded');
  });

  it('errors.rateLimited creates 429 error', () => {
    const err = errors.rateLimited('Too many requests');

    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMITED');
    expect(err.message).toBe('Too many requests');
  });

  it('errors.internal creates 500 error', () => {
    const err = errors.internal('Server error');

    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe('Server error');
  });

  it('errors.ttsError creates 500 error with TTS_ERROR code', () => {
    const err = errors.ttsError('TTS generation failed');

    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('TTS_ERROR');
    expect(err.message).toBe('TTS generation failed');
  });
});
