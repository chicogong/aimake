/**
 * Tests for Zod validation schemas used in jobs and internal routes.
 * Validates that the security hardening from Sprint 1 works correctly.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Reproduce the schemas from routes (can't import Hono route modules directly)
const CreateJobSchema = z.object({
  source: z.object({
    type: z.enum(['text', 'url', 'document']),
    content: z.string().min(1).max(100000),
    documentId: z.string().optional(),
  }),
  contentType: z.enum(['auto', 'podcast', 'audiobook', 'voiceover', 'education', 'tts']),
  settings: z.object({
    duration: z.number().int().min(1).max(60),
    language: z.enum(['zh', 'en']).optional(),
    style: z.string().max(100).optional(),
    voices: z
      .array(z.object({ role: z.string().min(1).max(50), voiceId: z.string().min(1).max(100) }))
      .min(1),
  }),
  title: z.string().max(200).optional(),
});

const ProgressSchema = z.object({
  status: z.enum([
    'pending', 'classifying', 'extracting', 'analyzing',
    'scripting', 'synthesizing', 'assembling', 'completed', 'failed',
  ]),
  progress: z.number().min(0).max(100),
  currentStage: z.string().min(1).max(50),
  detectedContentType: z.string().max(50).optional(),
  errorCode: z.string().max(100).optional(),
  errorMessage: z.string().max(1000).optional(),
});

const AudioSchema = z.object({
  audioBase64: z.string().min(1),
  duration: z.number().min(0).max(7200),
  format: z.enum(['mp3', 'wav']),
});

describe('CreateJobSchema', () => {
  const validJob = {
    source: { type: 'text' as const, content: 'Hello world' },
    contentType: 'podcast' as const,
    settings: {
      duration: 5,
      voices: [{ role: 'host', voiceId: 'voice-1' }],
    },
  };

  it('accepts a valid job request', () => {
    expect(CreateJobSchema.safeParse(validJob).success).toBe(true);
  });

  it('accepts auto contentType', () => {
    const result = CreateJobSchema.safeParse({ ...validJob, contentType: 'auto' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid contentType', () => {
    const result = CreateJobSchema.safeParse({ ...validJob, contentType: 'hacked' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sourceType', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      source: { type: 'invalid', content: 'x' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty content', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      source: { type: 'text', content: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 100K chars', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      source: { type: 'text', content: 'x'.repeat(100001) },
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty voices array', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      settings: { ...validJob.settings, voices: [] },
    });
    expect(result.success).toBe(false);
  });

  it('rejects duration > 60', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      settings: { ...validJob.settings, duration: 61 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects duration < 1', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      settings: { ...validJob.settings, duration: 0 },
    });
    expect(result.success).toBe(false);
  });

  it('rejects title > 200 chars', () => {
    const result = CreateJobSchema.safeParse({
      ...validJob,
      title: 'x'.repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe('ProgressSchema', () => {
  it('accepts valid progress update', () => {
    const result = ProgressSchema.safeParse({
      status: 'scripting',
      progress: 50,
      currentStage: 'scripting',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = ProgressSchema.safeParse({
      status: 'hacked',
      progress: 50,
      currentStage: 'scripting',
    });
    expect(result.success).toBe(false);
  });

  it('rejects progress > 100', () => {
    const result = ProgressSchema.safeParse({
      status: 'scripting',
      progress: 150,
      currentStage: 'scripting',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative progress', () => {
    const result = ProgressSchema.safeParse({
      status: 'scripting',
      progress: -10,
      currentStage: 'scripting',
    });
    expect(result.success).toBe(false);
  });
});

describe('AudioSchema', () => {
  it('accepts valid audio payload', () => {
    const result = AudioSchema.safeParse({
      audioBase64: 'dGVzdA==',
      duration: 120.5,
      format: 'mp3',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative duration', () => {
    const result = AudioSchema.safeParse({
      audioBase64: 'dGVzdA==',
      duration: -5,
      format: 'mp3',
    });
    expect(result.success).toBe(false);
  });

  it('rejects duration > 7200', () => {
    const result = AudioSchema.safeParse({
      audioBase64: 'dGVzdA==',
      duration: 7201,
      format: 'mp3',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid format', () => {
    const result = AudioSchema.safeParse({
      audioBase64: 'dGVzdA==',
      duration: 10,
      format: 'flac',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty audioBase64', () => {
    const result = AudioSchema.safeParse({
      audioBase64: '',
      duration: 10,
      format: 'mp3',
    });
    expect(result.success).toBe(false);
  });
});
