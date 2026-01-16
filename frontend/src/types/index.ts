/**
 * Frontend Type Definitions
 */

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
    code: string;
    message: string;
    details?: unknown;
  };
}

// ============ User Types ============
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  plan: Plan;
  quota: QuotaInfo;
  createdAt: string;
}

export type Plan = 'free' | 'pro' | 'team';

export interface QuotaInfo {
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
}

// ============ Voice Types ============
export interface Voice {
  id: string;
  name: string;
  nameZh: string | null;
  provider: VoiceProvider;
  gender: 'male' | 'female' | 'neutral' | null;
  language: string[];
  style: string | null;
  previewUrl: string | null;
  isPremium: boolean;
  tags: string[];
}

export type VoiceProvider =
  | 'openai'
  | 'elevenlabs'
  | 'azure'
  | 'tencent'
  | 'minimax'
  | 'siliconflow';

// ============ Audio Types ============
export interface AudioResult {
  url: string;
  duration: number;
  size: number;
}

export interface Audio {
  id: string;
  title: string | null;
  text: string;
  type: 'tts' | 'podcast';
  voiceId: string | null;
  voiceName: string;
  duration: number;
  size: number;
  url: string;
  createdAt: string;
}

export interface AudioDetail extends Audio {
  settings: {
    speed: number | null;
    pitch: number | null;
    format: string;
  };
  usage: {
    characters: number;
    cost: number;
  };
}

// ============ TTS Types ============
export interface TTSRequest {
  text: string;
  voiceId: string;
  speed?: number;
  pitch?: number;
  format?: 'mp3' | 'wav';
}

export interface TTSJob {
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

// ============ Usage Types ============
export interface UsageRecord {
  id: string;
  type: 'tts' | 'podcast';
  audioId: string | null;
  podcastId: string | null;
  characters: number;
  duration: number;
  cost: number;
  provider: string | null;
  createdAt: string;
}

export interface UsageSummary {
  totalCharacters: number;
  totalDuration: number;
  totalCost: number;
}

// ============ Subscription Types ============
export interface Subscription {
  status: 'none' | 'active' | 'canceled' | 'past_due';
  plan: Plan;
  currentPeriod?: {
    start: string;
    end: string;
  };
  cancelAtPeriodEnd?: boolean;
}
