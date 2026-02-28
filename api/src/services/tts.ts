/**
 * TTS Service
 * Handles direct text-to-speech generation (quick TTS only)
 * Supports: OpenAI, SiliconFlow (FishAudio)
 */

import type { Env } from '../types';
import type { Database, User } from '../db';
import { users, usageLogs } from '../db';
import { eq, sql } from 'drizzle-orm';
import { generateId } from '../utils/id';
import { errors } from '../middleware/error';

const PROVIDERS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1/audio/speech',
    model: 'tts-1',
  },
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1/audio/speech',
    model: 'fnlp/MOSS-TTSD-v0.5',
  },
};

const CHARS_PER_SECOND = 150;

export class TTSService {
  private db: Database;
  private env: Env;

  constructor(db: Database, env: Env) {
    this.db = db;
    this.env = env;
  }

  /**
   * Generate audio directly (sync mode for quick TTS)
   */
  async generateDirect(
    user: User,
    request: {
      text: string;
      voiceId: string;
      speed?: number;
      pitch?: number;
      format?: 'mp3' | 'wav';
    }
  ): Promise<ArrayBuffer> {
    const { text, voiceId, speed = 1.0, format = 'mp3' } = request;

    if (text.length > 5000) {
      throw errors.validation('文本长度不能超过 5000 字符');
    }

    const estimatedDuration = Math.ceil(text.length / CHARS_PER_SECOND);
    const remaining = user.quotaLimit - user.quotaUsed;

    if (remaining < estimatedDuration) {
      throw errors.quotaExceeded(
        `额度不足，剩余 ${remaining} 秒，预计需要 ${estimatedDuration} 秒`
      );
    }

    const provider = this.getProvider(voiceId);

    const audioBuffer = await this.generateAudio({
      text,
      voiceId,
      speed,
      format,
      provider,
    });

    const now = new Date().toISOString();
    await this.db
      .update(users)
      .set({
        quotaUsed: sql`${users.quotaUsed} + ${estimatedDuration}`,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    await this.db.insert(usageLogs).values({
      id: generateId(),
      userId: user.id,
      type: 'tts',
      charsUsed: text.length,
      durationUsed: estimatedDuration,
      provider,
      createdAt: now,
    });

    return audioBuffer;
  }

  private getProvider(voiceId: string): string {
    if (voiceId.startsWith('openai-')) return 'openai';
    if (voiceId.startsWith('sf-') || voiceId.startsWith('siliconflow-')) return 'siliconflow';
    if (voiceId.startsWith('fish-')) return 'siliconflow';
    if (voiceId.startsWith('tencent-')) return 'tencent';
    if (voiceId.startsWith('eleven-')) return 'elevenlabs';
    return 'siliconflow';
  }

  private async generateAudio(params: {
    text: string;
    voiceId: string;
    speed: number;
    format: string;
    provider: string;
  }): Promise<ArrayBuffer> {
    const { text, voiceId, speed, format, provider } = params;

    if (provider === 'openai' && !this.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, falling back to SiliconFlow');
      return this.generateSiliconFlow(text, voiceId, speed, format);
    }

    switch (provider) {
      case 'openai':
        return this.generateOpenAI(text, voiceId, speed, format);
      case 'siliconflow':
        return this.generateSiliconFlow(text, voiceId, speed, format);
      default:
        return this.generateSiliconFlow(text, voiceId, speed, format);
    }
  }

  private async generateOpenAI(
    text: string,
    voiceId: string,
    speed: number,
    format: string
  ): Promise<ArrayBuffer> {
    if (!this.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

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

  private async generateSiliconFlow(
    text: string,
    voiceId: string,
    speed: number,
    format: string
  ): Promise<ArrayBuffer> {
    if (!this.env.SILICONFLOW_API_KEY) {
      throw new Error('SiliconFlow API key not configured');
    }

    let voice = voiceId.replace('sf-', '').replace('siliconflow-', '').replace('fish-', '');

    const voiceMap: Record<string, string> = {
      default: 'fnlp/MOSS-TTSD-v0.5:alex',
      alex: 'fnlp/MOSS-TTSD-v0.5:alex',
      benjamin: 'fnlp/MOSS-TTSD-v0.5:benjamin',
      charles: 'fnlp/MOSS-TTSD-v0.5:charles',
      david: 'fnlp/MOSS-TTSD-v0.5:david',
      anna: 'fnlp/MOSS-TTSD-v0.5:anna',
      bella: 'fnlp/MOSS-TTSD-v0.5:bella',
      claire: 'fnlp/MOSS-TTSD-v0.5:claire',
      diana: 'fnlp/MOSS-TTSD-v0.5:diana',
    };

    const reference = voiceMap[voice] || voiceMap['default'];

    const response = await fetch(PROVIDERS.siliconflow.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.env.SILICONFLOW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: PROVIDERS.siliconflow.model,
        input: text,
        voice: reference,
        response_format: format === 'wav' ? 'wav' : 'mp3',
        speed,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SiliconFlow TTS error:', error);
      throw new Error(`SiliconFlow TTS error: ${response.status} ${error}`);
    }

    return response.arrayBuffer();
  }
}
