import { describe, it, expect, beforeEach } from 'vitest';
import { audioStore } from '../utils/audio-store.js';

describe('AudioStore', () => {
  beforeEach(() => {
    // Clear the singleton before each test
    audioStore.clear('test-job');
  });

  it('should store and retrieve segments', () => {
    const jobId = 'test-job';
    const segment = { index: 0, audioBase64: 'base64data', duration: 10 };

    audioStore.set(jobId, segment);
    expect(audioStore.get(jobId, 0)).toEqual(segment);
    expect(audioStore.count(jobId)).toBe(1);
  });

  it('should return segments sorted by index', () => {
    const jobId = 'test-job';
    audioStore.set(jobId, { index: 2, audioBase64: 'c', duration: 10 });
    audioStore.set(jobId, { index: 0, audioBase64: 'a', duration: 10 });
    audioStore.set(jobId, { index: 1, audioBase64: 'b', duration: 10 });

    const all = audioStore.getAll(jobId);
    expect(all.map((s) => s.index)).toEqual([0, 1, 2]);
  });

  it('should clear data for a job', () => {
    const jobId = 'test-job';
    audioStore.set(jobId, { index: 0, audioBase64: 'a', duration: 10 });
    audioStore.setAssembled(jobId, { audioBase64: 'full', totalDuration: 10 });

    audioStore.clear(jobId);
    expect(audioStore.count(jobId)).toBe(0);
    expect(audioStore.getAssembled(jobId)).toBeUndefined();
  });

  it('should provide accurate stats', () => {
    audioStore.clear('job1');
    audioStore.clear('job2');

    audioStore.set('job1', { index: 0, audioBase64: 'a', duration: 5 });
    audioStore.set('job1', { index: 1, audioBase64: 'b', duration: 5 });
    audioStore.set('job2', { index: 0, audioBase64: 'c', duration: 5 });

    const stats = audioStore.stats();
    // Use check for current content since it's a singleton
    expect(stats.activeJobs).toBeGreaterThanOrEqual(2);
    expect(stats.totalSegments).toBeGreaterThanOrEqual(3);
  });
});
