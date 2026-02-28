/**
 * HTTP client for sending callbacks to Workers API
 * Updates job progress, script, and audio
 */

import type {
  AudioCallbackPayload,
  ProgressCallbackPayload,
  ScriptCallbackPayload,
} from '../types.js';

export class CallbackClient {
  constructor(
    private baseUrl: string,
    private secret: string
  ) {}

  private async post(path: string, body: unknown): Promise<void> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': this.secret,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => 'unknown');
      console.error(`Callback failed: ${response.status} ${url} — ${text}`);
    }
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
