/**
 * Generic retry helper with timeout, exponential backoff, and selective retry.
 * Shared by TTSClient and CallbackClient.
 */

export interface RetryOptions {
  maxAttempts: number;
  timeoutMs: number;
  baseDelayMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
  label?: string;
}

export async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    timeoutMs,
    baseDelayMs = 1000,
    shouldRetry,
    onRetry,
    label = 'request',
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fn(controller.signal);
    } catch (err) {
      lastError =
        err instanceof Error && err.name === 'AbortError' && controller.signal.aborted
          ? new Error(`${label} timeout after ${timeoutMs}ms`)
          : err;

      const retryable = shouldRetry ? shouldRetry(lastError) : true;
      if (!retryable || attempt === maxAttempts) {
        throw lastError;
      }

      onRetry?.(attempt, lastError);
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)));
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

/**
 * Retry policy: HTTP responses where status >= 500 or status === 429 are retryable.
 * 4xx (except 429) are surfaced immediately. Network errors are retried.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const httpRetryPolicy = (err: unknown): boolean => {
  if (err instanceof HttpError) {
    return err.status >= 500 || err.status === 429;
  }
  return true;
};
