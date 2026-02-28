/**
 * Date utilities
 */

/**
 * Get the ISO string for the first day of next month.
 * Used for quota reset dates.
 */
export function getNextMonthReset(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}
