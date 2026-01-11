/**
 * TTS Service
 * Handles text-to-speech generation using multiple providers
 */

import type { Env, TTSGenerateRequest, TTSJobResult } from '../types';
import type { Database, User } from '../db';
import { ttsJobs, audios, users, usageLogs } from '../db';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../utils/id';
import { errors } from '../middleware/error';

// Provider configuration
const PROVIDERS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1/audio/speech',
    model: 'tts-1',
    voices: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
  },
  tencent: {
    // Tencent Cloud TTS configuration
    // Will be implemented when we have the credentials
  },
};

// Cost estimation: ~150 characters per second of audio
const CHARS_PER_SECOND = 150;

export class TTSService {
  private db: Database;
  private env: Env;

  constructor(db: Database, env: Env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Create a TTS job
   */
  async createJob(user: User, request: TTSGenerateRequest): Promise<TTSJobResult> {
    const { text, voiceId, speed = 1.0, pitch = 0, format = 'mp3' } = request;

    // Validate text length
    if (text.length > 5000) {
      throw errors.validation('文本长度不能超过 5000 字符');
    }

    // Estimate duration and check quota
    const estimatedDuration = Math.ceil(text.length / CHARS_PER_SECOND);
    const remaining = user.quotaLimit - user.quotaUsed;

    if (remaining < estimatedDuration) {
      throw errors.quotaExceeded(`额度不足，剩余 ${remaining} 秒，预计需要 ${estimatedDuration} 秒`);
    }

    // Create job record
    const jobId = generateId();
    const now = new Date().toISOString();

    await this.db.insert(ttsJobs).values({
      id: jobId,
      userId: user.id,
      text,
      voiceId,
      speed,
      pitch,
      format,
      status: 'pending',
      progress: 0,
      createdAt: now,
    });

    // Process job asynchronously
    // In production, this would be done via a queue
    this.processJob(jobId, user.id).catch((err) => {
      console.error(`Job ${jobId} failed:`, err);
    });

    return {
      jobId,
      status: 'pending',
      estimatedTime: Math.ceil(estimatedDuration / 10) + 2, // Rough estimate
    };
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string, userId: string): Promise<TTSJobResult> {
    const [job] = await this.db
      .select()
      .from(ttsJobs)
      .where(and(eq(ttsJobs.id, jobId), eq(ttsJobs.userId, userId)))
      .limit(1);

    if (!job) {
      throw errors.notFound('任务不存在');
    }

    const result: TTSJobResult = {
      jobId: job.id,
      status: job.status,
      progress: job.progress || 0,
    };

    if (job.status === 'completed' && job.audioId) {
      const [audio] = await this.db
        .select()
        .from(audios)
        .where(eq(audios.id, job.audioId))
        .limit(1);

      if (audio) {
        result.audio = {
          id: audio.id,
          url: audio.audioUrl,
          duration: audio.duration,
          size: audio.fileSize || 0,
        };
      }
    }

    if (job.status === 'failed') {
      result.error = {
        code: job.errorCode || 'TTS_ERROR',
        message: job.errorMessage || '生成失败',
      };
    }

    return result;
  }

  /**
   * Process TTS job
   */
  private async processJob(jobId: string, userId: string): Promise<void> {
    const now = new Date().toISOString();

    // Update status to processing
    await this.db
      .update(ttsJobs)
      .set({ status: 'processing', progress: 10, startedAt: now })
      .where(eq(ttsJobs.id, jobId));

    try {
      // Get job details
      const [job] = await this.db.select().from(ttsJobs).where(eq(ttsJobs.id, jobId)).limit(1);

      if (!job) {
        throw new Error('Job not found');
      }

      // Determine provider based on voice ID
      const provider = this.getProvider(job.voiceId);

      // Update progress
      await this.db.update(ttsJobs).set({ progress: 30 }).where(eq(ttsJobs.id, jobId));

      // Generate audio
      const audioBuffer = await this.generateAudio({
        text: job.text,
        voiceId: job.voiceId,
        speed: job.speed || 1.0,
        format: job.format,
        provider,
      });

      // Update progress
      await this.db.update(ttsJobs).set({ progress: 70 }).where(eq(ttsJobs.id, jobId));

      // Upload to R2 or use local storage
      const audioId = generateId();
      const filename = `${userId}/${audioId}.${job.format}`;
      let audioUrl: string;

      if (this.env.R2) {
        await this.env.R2.put(filename, audioBuffer, {
          httpMetadata: {
            contentType: job.format === 'mp3' ? 'audio/mpeg' : 'audio/wav',
          },
        });
        audioUrl = `https://audio.aimake.cc/${filename}`;
      } else {
        // If R2 is not available, we can't store the file
        // In production, R2 should always be available
        throw new Error('Storage service not configured');
      }

      // Calculate actual duration (rough estimate)
      const duration = job.text.length / CHARS_PER_SECOND;

      // Create audio record
      await this.db.insert(audios).values({
        id: audioId,
        userId,
        title: job.text.substring(0, 50) + (job.text.length > 50 ? '...' : ''),
        text: job.text,
        textLength: job.text.length,
        voiceId: job.voiceId,
        audioUrl,
        audioFormat: job.format,
        duration,
        fileSize: audioBuffer.byteLength,
        speed: job.speed,
        pitch: job.pitch,
        type: 'tts',
        createdAt: now,
        updatedAt: now,
      });

      // Update user quota
      await this.db
        .update(users)
        .set({
          quotaUsed: Math.ceil(duration),
          updatedAt: now,
        })
        .where(eq(users.id, userId));

      // Log usage
      await this.db.insert(usageLogs).values({
        id: generateId(),
        userId,
        type: 'tts',
        charsUsed: job.text.length,
        durationUsed: duration,
        audioId,
        provider,
        createdAt: now,
      });

      // Update job as completed
      await this.db
        .update(ttsJobs)
        .set({
          status: 'completed',
          progress: 100,
          audioId,
          completedAt: now,
        })
        .where(eq(ttsJobs.id, jobId));
    } catch (error) {
      console.error(`TTS job ${jobId} error:`, error);

      // Update job as failed
      await this.db
        .update(ttsJobs)
        .set({
          status: 'failed',
          errorCode: 'TTS_ERROR',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: now,
        })
        .where(eq(ttsJobs.id, jobId));
    }
  }

  /**
   * Determine provider from voice ID
   */
  private getProvider(voiceId: string): string {
    if (voiceId.startsWith('openai-')) return 'openai';
    if (voiceId.startsWith('tencent-')) return 'tencent';
    if (voiceId.startsWith('eleven-')) return 'elevenlabs';
    return 'openai'; // Default
  }

  /**
   * Generate audio using the appropriate provider
   */
  private async generateAudio(params: {
    text: string;
    voiceId: string;
    speed: number;
    format: string;
    provider: string;
  }): Promise<ArrayBuffer> {
    const { text, voiceId, speed, format, provider } = params;

    if (provider === 'openai') {
      return this.generateOpenAI(text, voiceId, speed, format);
    }

    // Add more providers here
    throw new Error(`Provider ${provider} not supported`);
  }

  /**
   * Generate audio using OpenAI TTS
   */
  private async generateOpenAI(
    text: string,
    voiceId: string,
    speed: number,
    format: string
  ): Promise<ArrayBuffer> {
    const voice = voiceId.replace('openai-', '');

    const response = await fetch(PROVIDERS.openai.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PROVIDERS.openai.model,
        input: text,
        voice,
        speed,
        response_format: format,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI TTS error: ${error}`);
    }

    return response.arrayBuffer();
  }
}
