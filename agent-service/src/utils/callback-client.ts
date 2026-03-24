/**
 * HTTP client for sending callbacks to Workers API
 * Updates job progress, script, and audio.
 *
 * R1: Throws on failure (no more silent swallowing)
 * R4: Retry with exponential backoff + 30s timeout
 */

import type {
  AudioCallbackPayload,
  ProgressCallbackPayload,
  ScriptCallbackPayload,
} from '../types.js';

const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;

export class CallbackClient {
  constructor(
    private baseUrl: string,
    private secret: string
  ) {}

  private async post(path: string, body: unknown): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': this.secret,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (response.ok) return;

        const text = await response.text().catch(() => 'unknown');
        lastError = new Error(`Callback failed: ${response.status} ${url} — ${text}`);

        // Don't retry client errors (4xx) except 429 (rate limited)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw lastError;
        }
      } catch (err) {
        if (err === lastError) throw err; // Re-throw non-retryable errors

        if (err instanceof Error && err.name === 'AbortError') {
          lastError = new Error(`Callback timeout after ${TIMEOUT_MS}ms: ${url}`);
        } else {
          lastError = err instanceof Error ? err : new Error(String(err));
        }
      }

      // Exponential backoff before retry
      if (attempt < MAX_RETRIES - 1) {
        const delay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, delay));
        console.warn(`[callback] Retry ${attempt + 1}/${MAX_RETRIES - 1} for ${url}`);
      }
    }

    throw lastError || new Error(`Callback failed after ${MAX_RETRIES} retries: ${url}`);
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
