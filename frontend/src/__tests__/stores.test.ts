import { describe, it, expect, beforeEach } from 'vitest';
import { useTTSStore } from '../stores/ttsStore';
import type { Voice } from '../types';

describe('TTS Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useTTSStore.setState({
      text: '',
      selectedVoice: null,
      speed: 1.0,
      pitch: 0,
      format: 'mp3',
      isGenerating: false,
      currentJob: null,
      isPlaying: false,
      currentAudioUrl: null,
    });
  });

  it('has correct initial state', () => {
    const state = useTTSStore.getState();

    expect(state.text).toBe('');
    expect(state.selectedVoice).toBeNull();
    expect(state.speed).toBe(1.0);
    expect(state.pitch).toBe(0);
    expect(state.format).toBe('mp3');
    expect(state.isGenerating).toBe(false);
  });

  it('setText updates text state', () => {
    useTTSStore.getState().setText('Hello world');

    expect(useTTSStore.getState().text).toBe('Hello world');
  });

  it('setVoice updates selectedVoice state', () => {
    const voice: Voice = {
      id: 'voice-1',
      name: 'Test Voice',
      nameZh: '测试音色',
      provider: 'openai',
      gender: 'male',
      language: ['zh-CN'],
      style: '温暖',
      previewUrl: null,
      isPremium: false,
      tags: [],
    };

    useTTSStore.getState().setVoice(voice);

    expect(useTTSStore.getState().selectedVoice).toEqual(voice);
  });

  it('setSpeed updates speed state', () => {
    useTTSStore.getState().setSpeed(1.5);

    expect(useTTSStore.getState().speed).toBe(1.5);
  });

  it('setPitch updates pitch state', () => {
    useTTSStore.getState().setPitch(10);

    expect(useTTSStore.getState().pitch).toBe(10);
  });

  it('setFormat updates format state', () => {
    useTTSStore.getState().setFormat('wav');

    expect(useTTSStore.getState().format).toBe('wav');
  });

  it('setIsGenerating updates generating state', () => {
    useTTSStore.getState().setIsGenerating(true);

    expect(useTTSStore.getState().isGenerating).toBe(true);
  });

  it('reset clears all state', () => {
    // Set some state first
    useTTSStore.getState().setText('Test text');
    useTTSStore.getState().setSpeed(2.0);
    useTTSStore.getState().setIsGenerating(true);

    useTTSStore.getState().reset();

    const state = useTTSStore.getState();
    expect(state.text).toBe('');
    expect(state.speed).toBe(1.0);
    expect(state.isGenerating).toBe(false);
  });
});
