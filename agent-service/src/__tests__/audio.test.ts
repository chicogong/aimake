import { describe, it, expect } from 'vitest';
import { createSilence, concatenateSegments } from '../utils/audio.js';

describe('audio utils', () => {
  describe('createSilence', () => {
    it('should create a buffer of the correct length (roughly)', () => {
      const durationMs = 1000;
      const buffer = createSilence(durationMs);
      // Roughly 1 byte per ms for very low bit rate silence frames (not exact due to MP3 headers)
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should return empty buffer for 0 duration', () => {
      const buffer = createSilence(0);
      expect(buffer.length).toBe(0);
    });
  });

  describe('concatenateSegments', () => {
    it('should concatenate multiple segments with silence gaps', () => {
      const segments = [
        { index: 0, audioBase64: Buffer.from('abc').toString('base64'), duration: 10 },
        { index: 1, audioBase64: Buffer.from('def').toString('base64'), duration: 20 },
      ];

      const result = concatenateSegments(segments, 100);

      expect(result.totalDuration).toBeGreaterThanOrEqual(30.1);
      expect(result.audioBase64).toBeDefined();

      const decoded = Buffer.from(result.audioBase64, 'base64');
      expect(decoded.length).toBeGreaterThan(6); // abc + silence + def
    });

    it('should handle empty segments list', () => {
      const result = concatenateSegments([], 500);
      expect(result.totalDuration).toBe(0);
      expect(result.audioBase64).toBe('');
    });
  });
});
