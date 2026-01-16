/**
 * Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

import { ErrorHandler } from 'hono';
import type { Env, Variables, ErrorCode } from '../types';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Common error factories
export const errors = {
  badRequest: (message: string, details?: unknown) =>
    new AppError('BAD_REQUEST', 400, message, details),

  unauthorized: (message = '请先登录') => new AppError('UNAUTHORIZED', 401, message),

  forbidden: (message = '无权限访问') => new AppError('FORBIDDEN', 403, message),

  notFound: (message = '资源不存在') => new AppError('NOT_FOUND', 404, message),

  validation: (message: string, details?: unknown) =>
    new AppError('VALIDATION_ERROR', 400, message, details),

  quotaExceeded: (message = '额度不足，请升级套餐') =>
    new AppError('QUOTA_EXCEEDED', 403, message),

  rateLimited: (message = '请求过于频繁，请稍后再试') =>
    new AppError('RATE_LIMITED', 429, message),

  internal: (message = '服务器内部错误', details?: unknown) =>
    new AppError('INTERNAL_ERROR', 500, message, details),

  ttsError: (message: string, details?: unknown) =>
    new AppError('TTS_ERROR', 500, message, details),

  paymentError: (message: string, details?: unknown) =>
    new AppError('PAYMENT_ERROR', 400, message, details),
};

export const errorHandler: ErrorHandler<{ Bindings: Env; Variables: Variables }> = (err, c) => {
  console.error('Error:', err);

  // Handle AppError
  if (err instanceof AppError) {
    const response: {
      success: false;
      error: {
        code: ErrorCode;
        message: string;
        details?: unknown;
      };
    } = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    // Only include details in development
    if (c.env.ENVIRONMENT === 'development' && err.details) {
      response.error.details = err.details;
    }

    return c.json(response, err.statusCode as 400 | 401 | 403 | 404 | 429 | 500);
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return c.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR' as ErrorCode,
          message: '请求参数错误',
          details: c.env.ENVIRONMENT === 'development' ? err : undefined,
        },
      },
      400
    );
  }

  // Handle unknown errors
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR' as ErrorCode,
        message: '服务器内部错误',
        details: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
      },
    },
    500
  );
};
