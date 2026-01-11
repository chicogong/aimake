/**
 * TTS Store
 * Zustand store for TTS state management
 */

import { create } from 'zustand';
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
  selectedVoice: null,
  speed: 1.0,
  pitch: 0,
  format: 'mp3' as const,
  currentJob: null,
  isGenerating: false,
  isPlaying: false,
  currentAudioUrl: null,
};

export const useTTSStore = create<TTSState>()((set) => ({
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
}));
