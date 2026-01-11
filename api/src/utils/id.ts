/**
 * ID Generation Utilities
 */

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a prefixed ID (e.g., 'job_xxx', 'audio_xxx')
 */
export function generatePrefixedId(prefix: string): string {
  return `${prefix}_${generateId().replace(/-/g, '')}`;
}

/**
 * Generate a short ID (8 characters)
 */
export function generateShortId(): string {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8);
}
