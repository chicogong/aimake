/**
 * API Client
 * Axios-based HTTP client with Clerk auth integration
 */

import axios, { AxiosError } from 'axios';
import type { ApiError } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Store getToken function for use in generateSync
let _getToken: (() => Promise<string | null>) | null = null;
let _authSetup = false;

// Request interceptor - adds auth token
export function setupApiAuth(getToken: () => Promise<string | null>) {
  if (_authSetup) {
    return;
  }
  _authSetup = true;
  _getToken = getToken;
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return config;
  });
}

// Response interceptor - handles errors
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiError>) => {
    const errorData = error.response?.data?.error;

    // Create a standardized error
    const apiError = {
      code: errorData?.code || 'NETWORK_ERROR',
      message: errorData?.message || '网络错误，请稍后重试',
      details: errorData?.details,
    };

    // Handle specific error codes
    if (apiError.code === 'UNAUTHORIZED') {
      // Redirect to login or show login modal
      window.dispatchEvent(new CustomEvent('auth:required'));
    }

    throw apiError;
  }
);

// ============ API Methods ============

// Health check
export const healthApi = {
  check: () => api.get('/health'),
};

// Voices
export const voicesApi = {
  list: (params?: { provider?: string; gender?: string; premium?: boolean }) =>
    api.get('/voices', { params }),

  getPreview: (id: string) => api.get(`/voices/${id}/preview`),
};

// TTS
export const ttsApi = {
  // Sync generate - returns audio blob directly
  generateSync: async (data: {
    text: string;
    voiceId: string;
    speed?: number;
    pitch?: number;
    format?: 'mp3' | 'wav';
  }): Promise<Blob> => {
    // Get token from stored getToken function
    let token: string | null = null;
    if (_getToken) {
      try {
        token = await _getToken();
      } catch (e) {
        console.error('Failed to get token for TTS:', e);
      }
    }

    // Use fetch directly to avoid axios response interceptor interfering with blob
    const response = await fetch(`${API_BASE}/tts/generate-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        code: errorData?.error?.code || 'TTS_ERROR',
        message: errorData?.error?.message || '语音生成失败',
      };
    }

    return response.blob();
  },
};

// Audios
export const audiosApi = {
  list: (params?: { page?: number; pageSize?: number; type?: string; search?: string }) =>
    api.get('/audios', { params }),

  get: (id: string) => api.get(`/audios/${id}`),

  delete: (id: string) => api.delete(`/audios/${id}`),

  download: (id: string) => api.get(`/audios/${id}/download`, { responseType: 'blob' }),
};

// User
export const userApi = {
  getMe: () => api.get('/auth/me'),

  getQuota: () => api.get('/user/quota'),

  getUsage: (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
  }) => api.get('/user/usage', { params }),
};

// Subscription
export const subscriptionApi = {
  get: () => api.get('/subscription'),

  createCheckout: (data: {
    plan: 'pro' | 'team';
    interval: 'month' | 'year';
    successUrl: string;
    cancelUrl: string;
  }) => api.post('/subscription/checkout', data),
};
