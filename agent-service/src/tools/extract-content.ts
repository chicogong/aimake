/**
 * extract_content tool
 * Extracts clean text from a URL or plain text input.
 */

import { tool } from '@tencent-ai/agent-sdk';
import { z } from 'zod';

export const extractContentTool = tool(
  'extract_content',
  'Extract clean text content from a URL or plain text. ' +
    'For URL: fetches the webpage and extracts the main text content. ' +
    'For text: returns the text with metadata. ' +
    'Call this to get the source material for content generation.',
  {
    type: z.enum(['url', 'text', 'document']).describe('Source type'),
    content: z.string().describe('The URL to fetch or the raw text content'),
  },
  async ({ type, content }) => {
    try {
      if (type === 'text' || type === 'document') {
        const language = detectLanguage(content);
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                title: null,
                text: content,
                charCount: content.length,
                language,
              }),
            },
          ],
        };
      }

      // URL extraction
      const response = await fetch(content, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AIMake/1.0; +https://aimake.cc)',
        },
      });

      if (!response.ok) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: false,
                error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
              }),
            },
          ],
        };
      }

      const html = await response.text();
      const text = stripHtml(html);
      const title = extractTitle(html);
      const language = detectLanguage(text);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: true,
              title,
              text,
              charCount: text.length,
              language,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Content extraction failed',
            }),
          },
        ],
      };
    }
  }
);

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<\/?(p|div|br|h[1-6]|li|blockquote|tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

export function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (match) {
    return match[1].replace(/<[^>]+>/g, '').trim() || null;
  }
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim() || null;
  }
  return null;
}

export function detectLanguage(text: string): 'zh' | 'en' {
  const cjkPattern = /[\u4e00-\u9fff\u3400-\u4dbf]/g;
  const cjkMatches = text.match(cjkPattern);
  const cjkRatio = cjkMatches ? cjkMatches.length / text.length : 0;
  return cjkRatio > 0.3 ? 'zh' : 'en';
}
