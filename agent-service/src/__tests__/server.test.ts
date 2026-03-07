import { describe, it, expect } from 'vitest';
import { GenerateRequestSchema } from '../types.js';

describe('GenerateRequestSchema', () => {
  it('should validate a correct request', () => {
    const validRequest = {
      jobId: 'job-123',
      source: {
        type: 'text',
        content: 'Hello world',
      },
      contentType: 'podcast',
      settings: {
        episodeDuration: 5,
        voices: [
          { role: 'host', voiceId: 'v1' },
          { role: 'guest', voiceId: 'v2' },
        ],
      },
    };

    const result = GenerateRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject a request with missing fields', () => {
    const invalidRequest = {
      jobId: 'job-123',
      // missing source and settings
    };

    const result = GenerateRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject invalid source type', () => {
    const invalidRequest = {
      jobId: 'job-123',
      source: {
        type: 'invalid-type',
        content: 'xxx',
      },
      contentType: 'podcast',
      settings: {
        episodeDuration: 5,
        voices: [],
      },
    };

    const result = GenerateRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});
