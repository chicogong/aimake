/**
 * HTTP client for sending callbacks to Workers API.
 * Updates job progress, script, and audio.
 */

import type {
  AudioCallbackPayload,
  ProgressCallbackPayload,
  ScriptCallbackPayload,
} from '../types.js';
import { withRetry, HttpError, httpRetryPolicy } from './with-retry.js';

const MAX_ATTEMPTS = 3;
const TIMEOUT_MS = 30000;

export class CallbackClient {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string
  ) {}

  private async post(path: string, body: unknown): Promise<void> {
    const url = `${this.baseUrl}${path}`;

    await withRetry(
      async (signal) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': this.secret,
          },
          body: JSON.stringify(body),
          signal,
        });

        if (response.ok) return;

        const text = await response.text().catch(() => 'unknown');
        throw new HttpError(
          response.status,
          `Callback failed: ${response.status} ${url} — ${text}`
        );
      },
      {
        maxAttempts: MAX_ATTEMPTS,
        timeoutMs: TIMEOUT_MS,
        shouldRetry: httpRetryPolicy,
        label: `callback ${path}`,
        onRetry: (attempt, err) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[callback] retry ${attempt}/${MAX_ATTEMPTS - 1} ${url}: ${msg}`);
        },
      }
    );
  }

  async updateProgress(jobId: string, payload: ProgressCallbackPayload): Promise<void> {
    await this.post(`/api/internal/jobs/${jobId}/progress`, payload);
  }

  async saveScript(jobId: string, payload: ScriptCallbackPayload): Promise<void> {
    await this.post(`/api/internal/jobs/${jobId}/script`, payload);
  }

  async uploadAudio(jobId: string, payload: AudioCallbackPayload): Promise<void> {
    await this.post(`/api/internal/jobs/${jobId}/audio`, payload);
  }
}
