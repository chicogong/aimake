/**
 * Response Utilities
 */

import type { Context } from 'hono';
import type { ApiResponse, ApiError } from '../types';

/**
 * Return a successful response
 */
export function success<T>(
  c: Context,
  data: T,
  meta?: { total?: number; page?: number; pageSize?: number }
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return c.json(response);
}

/**
 * Return a created response (201)
 */
export function created<T>(c: Context, data: T): Response {
  return c.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    201
  );
}

/**
 * Return an error response
 */
export function error(
  c: Context,
  code: ApiError['error']['code'],
  message: string,
  statusCode: number = 400,
  details?: unknown
): Response {
  const response: ApiError = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  return c.json(response, statusCode as 400 | 401 | 403 | 404 | 429 | 500);
}
