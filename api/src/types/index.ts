/**
 * AIMake API Type Definitions
 */

import type { User } from '../db/schema';

// ============ Environment Bindings ============
export interface Env {
  // Cloudflare Services
  DB: D1Database;
  KV: KVNamespace;
  R2?: R2Bucket; // Optional, needs to be enabled in Dashboard

  // Environment Variables
  ENVIRONMENT: 'development' | 'production';
  CORS_ORIGIN: string;

  // Secrets (set via wrangler secret put)
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // TTS API Keys
  OPENAI_API_KEY: string;
  TENCENT_SECRET_ID?: string;
  TENCENT_SECRET_KEY?: string;
  ELEVENLABS_API_KEY?: string;

  // LLM API Keys
  SILICONFLOW_API_KEY?: string;
}

// ============ Hono Context Variables ============
export interface Variables {
  user: User;
  requestId: string;
}

// ============ API Response Types ============
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'TTS_ERROR'
  | 'PAYMENT_ERROR';

// ============ Pagination ============
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============ Voice Types ============
export type VoiceProvider = 'openai' | 'elevenlabs' | 'azure' | 'tencent' | 'minimax';

export interface VoiceInfo {
  id: string;
  name: string;
  nameZh: string | null;
  provider: VoiceProvider;
  gender: 'male' | 'female' | 'neutral' | null;
  language: string | null;
  style: string | null;
  previewUrl: string | null;
  isPremium: boolean;
  tags?: string[];
}

// ============ TTS Types ============
export interface TTSGenerateRequest {
  text: string;
  voiceId: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav';
}

export interface TTSJobResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  estimatedTime?: number;
  audio?: {
    id: string;
    url: string;
    duration: number;
    size: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ============ Podcast Types ============
export interface PodcastGenerateRequest {
  source: {
    type: 'text' | 'url';
    content: string;
  };
  settings: {
    duration: 5 | 10 | 15 | 20;
    style: 'casual' | 'professional' | 'debate';
    hostVoiceId: string;
    guestVoiceId: string;
    language?: 'zh' | 'en';
  };
  title?: string;
}

export interface PodcastScript {
  segments: Array<{
    speaker: 'host' | 'guest';
    text: string;
    startTime: number;
    endTime: number;
  }>;
}

// ============ Subscription Types ============
export type Plan = 'free' | 'pro' | 'team';

export interface QuotaInfo {
  plan: Plan;
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

export interface SubscriptionInfo {
  status: 'none' | 'active' | 'canceled' | 'past_due';
  plan: Plan;
  currentPeriod?: {
    start: string;
    end: string;
  };
  cancelAtPeriodEnd?: boolean;
}

// ============ Checkout Types ============
export interface CheckoutRequest {
  plan: 'pro' | 'team';
  interval: 'month' | 'year';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}
