/**
 * Helpers for standardizing tool responses
 */

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  [key: string]: unknown;
}

/**
 * Returns a successful tool response with the given data as JSON string
 */
export function toolSuccess(data: any = { success: true }): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data),
      },
    ],
  };
}

/**
 * Returns a failed tool response with the given error message
 */
export function toolError(message: string, code?: string): ToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: message,
          ...(code ? { code } : {}),
        }),
      },
    ],
  };
}

/**
 * Safely handles tool execution with standardized error reporting
 */
export async function withErrorHandling(
  fn: () => Promise<ToolResponse>,
  fallbackMessage: string
): Promise<ToolResponse> {
  try {
    return await fn();
  } catch (error) {
    console.error(`${fallbackMessage}:`, error);
    return toolError(error instanceof Error ? error.message : fallbackMessage);
  }
}
