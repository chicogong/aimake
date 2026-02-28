/**
 * Audio utilities for MP3 assembly
 */

const SILENT_FRAME = Buffer.from(
  'fffb9004' + '0000000000000000000000000000000000000000000000000000000000000000' +
  '00'.repeat(383),
  'hex'
);
const FRAME_DURATION_MS = 26.12;

export function createSilence(durationMs: number): Buffer {
  const frameCount = Math.ceil(durationMs / FRAME_DURATION_MS);
  const frames: Buffer[] = [];
  for (let i = 0; i < frameCount; i++) {
    frames.push(SILENT_FRAME);
  }
  return Buffer.concat(frames);
}

export function concatenateSegments(
  segments: { audioBase64: string; index: number; duration: number }[],
  gapMs = 500
): { audioBase64: string; totalDuration: number } {
  const sorted = [...segments].sort((a, b) => a.index - b.index);

  const silenceBuffer = createSilence(gapMs);
  const silenceDuration = gapMs / 1000;

  const parts: Buffer[] = [];
  let totalDuration = 0;

  for (let i = 0; i < sorted.length; i++) {
    const segment = sorted[i];
    parts.push(Buffer.from(segment.audioBase64, 'base64'));
    totalDuration += segment.duration;

    if (i < sorted.length - 1) {
      parts.push(silenceBuffer);
      totalDuration += silenceDuration;
    }
  }

  const combined = Buffer.concat(parts);
  return {
    audioBase64: combined.toString('base64'),
    totalDuration: Math.round(totalDuration * 10) / 10,
  };
}
