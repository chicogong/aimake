/**
 * TTS Store
 * Zustand store for TTS state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Voice, TTSJob } from '@/types';

interface TTSState {
  // Input
  text: string;
  selectedVoice: Voice | null;
  speed: number;
  pitch: number;
  format: 'mp3' | 'wav';

  // Job
  currentJob: TTSJob | null;
  isGenerating: boolean;

  // Audio player
  isPlaying: boolean;
  currentAudioUrl: string | null;

  // Actions
  setText: (text: string) => void;
  setVoice: (voice: Voice | null) => void;
  setSpeed: (speed: number) => void;
  setPitch: (pitch: number) => void;
  setFormat: (format: 'mp3' | 'wav') => void;
  setCurrentJob: (job: TTSJob | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentAudioUrl: (url: string | null) => void;
  reset: () => void;
}

const initialState = {
  text: '',
  // Default to SiliconFlow voice (sf-anna is a good default female voice)
  selectedVoice: {
    id: 'sf-anna',
    name: 'Anna',
    nameZh: '安娜',
    provider: 'siliconflow',
    gender: 'female',
    language: ['zh-CN'],
    style: '甜美女声',
    previewUrl: null,
    isPremium: false,
    tags: ['甜美女声'],
  } as Voice,
  speed: 1.0,
  pitch: 0,
  format: 'mp3' as const,
  currentJob: null,
  isGenerating: false,
  isPlaying: false,
  currentAudioUrl: null,
};

export const useTTSStore = create<TTSState>()(
  persist(
    (set) => ({
      ...initialState,

      setText: (text) => set({ text }),

      setVoice: (selectedVoice) => set({ selectedVoice }),

      setSpeed: (speed) => set({ speed }),

      setPitch: (pitch) => set({ pitch }),

      setFormat: (format) => set({ format }),

      setCurrentJob: (currentJob) => set({ currentJob }),

      setIsGenerating: (isGenerating) => set({ isGenerating }),

      setIsPlaying: (isPlaying) => set({ isPlaying }),

      setCurrentAudioUrl: (currentAudioUrl) => set({ currentAudioUrl }),

      reset: () => set(initialState),
    }),
    {
      name: 'aimake-tts-v2', // Versioned to reset state
      partialize: (state) => ({
        text: state.text,
        selectedVoice: state.selectedVoice,
        speed: state.speed,
        pitch: state.pitch,
        format: state.format,
      }),
    }
  )
);
