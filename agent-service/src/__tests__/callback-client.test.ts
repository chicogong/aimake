import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CallbackClient } from '../utils/callback-client.js';

describe('CallbackClient', () => {
  const originalFetch = globalThis.fetch;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should succeed on first try with 200 response', async () => {
    mockFetch.mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await client.updateProgress('job-1', {
      status: 'classifying',
      progress: 5,
      currentStage: 'classifying',
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8787/api/internal/jobs/job-1/progress',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Internal-Secret': 'secret',
        }),
      })
    );
  });

  it('should throw on 4xx client error without retrying', async () => {
    mockFetch.mockResolvedValueOnce(new Response('Bad Request', { status: 400 }));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await expect(
      client.updateProgress('job-1', {
        status: 'classifying',
        progress: 5,
        currentStage: 'classifying',
      })
    ).rejects.toThrow('Callback failed: 400');

    expect(mockFetch).toHaveBeenCalledTimes(1); // No retry on 4xx
  });

  it('should retry on 5xx server error and succeed', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response('Internal Error', { status: 500 }))
      .mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await client.updateProgress('job-1', {
      status: 'classifying',
      progress: 5,
      currentStage: 'classifying',
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw after exhausting retries on persistent 5xx', async () => {
    mockFetch
      .mockResolvedValue(new Response('Internal Error', { status: 500 }));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await expect(
      client.updateProgress('job-1', {
        status: 'classifying',
        progress: 5,
        currentStage: 'classifying',
      })
    ).rejects.toThrow('Callback failed: 500');

    expect(mockFetch).toHaveBeenCalledTimes(3); // 3 retries
  });

  it('should retry on 429 rate limit', async () => {
    mockFetch
      .mockResolvedValueOnce(new Response('Rate Limited', { status: 429 }))
      .mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await client.updateProgress('job-1', {
      status: 'classifying',
      progress: 5,
      currentStage: 'classifying',
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should throw on network error after retries', async () => {
    // Each call must create a new Error object (mockRejectedValue reuses the same object)
    mockFetch
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockRejectedValueOnce(new Error('fetch failed'))
      .mockRejectedValueOnce(new Error('fetch failed'));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await expect(
      client.saveScript('job-1', { script: '{}' })
    ).rejects.toThrow('fetch failed');

    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should send correct payload for uploadAudio', async () => {
    mockFetch.mockResolvedValueOnce(new Response('OK', { status: 200 }));

    const client = new CallbackClient('http://localhost:8787', 'secret');
    await client.uploadAudio('job-1', {
      audioBase64: 'dGVzdA==',
      duration: 10.5,
      format: 'mp3',
    });

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody).toEqual({
      audioBase64: 'dGVzdA==',
      duration: 10.5,
      format: 'mp3',
    });
  });
});
