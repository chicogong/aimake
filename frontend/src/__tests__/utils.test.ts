import { describe, it, expect } from 'vitest';
import { cn, formatDuration, formatFileSize, truncateText } from '../lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const falseCondition = false;
    const trueCondition = true;
    const result = cn('base', falseCondition && 'hidden', trueCondition && 'visible');
    expect(result).toBe('base visible');
  });

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null);
    expect(result).toBe('base');
  });

  it('merges tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });
});

describe('formatDuration', () => {
  it('formats seconds only', () => {
    expect(formatDuration(45)).toBe('0:45');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05');
  });

  it('formats large durations in minutes', () => {
    // Implementation formats as minutes:seconds without hours
    expect(formatDuration(3665)).toBe('61:05');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0:00');
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats large megabytes', () => {
    // Implementation caps at MB, doesn't support GB
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1024.0 MB');
  });

  it('handles zero', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });
});

describe('truncateText', () => {
  it('returns short text unchanged', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates long text at exact maxLength', () => {
    // Implementation: slice(0, maxLength) + '...'
    // So for maxLength 8, it keeps 8 chars then adds ...
    expect(truncateText('Hello World', 8)).toBe('Hello Wo...');
  });

  it('handles exact length', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(truncateText('', 10)).toBe('');
  });
});
