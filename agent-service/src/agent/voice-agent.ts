/**
 * Universal voice content agent
 * Uses Agent SDK to orchestrate the full pipeline:
 * Classify → Extract → Analyze → Script → Synthesize → Assemble
 *
 * R2: Exports activeJobs + markAllJobsFailed for graceful shutdown.
 */

import { query } from '@tencent-ai/agent-sdk';
import { createToolServer } from '../tools/index.js';
import { VOICE_AGENT_SYSTEM_PROMPT, buildUserPrompt } from './system-prompt.js';
import { audioStore } from '../utils/audio-store.js';
import { CallbackClient } from '../utils/callback-client.js';
import type { GenerateRequest } from '../types.js';

export const activeJobs = new Map<string, boolean>();

/**
 * Start generation in the background.
 * Returns immediately; progress is reported via callbacks.
 */
export function startGeneration(request: GenerateRequest): void {
  const { jobId } = request;

  if (activeJobs.has(jobId)) {
    console.warn(`Generation already in progress for job ${jobId}`);
    return;
  }

  activeJobs.set(jobId, true);

  generateContent(request)
    .catch((error) => {
      console.error(`Generation failed for ${jobId}:`, error);
    })
    .finally(() => {
      activeJobs.delete(jobId);
    });
}

/**
 * Mark all active jobs as failed and notify the API.
 * Called during graceful shutdown.
 */
export async function markAllJobsFailed(reason: string): Promise<void> {
  const jobIds = Array.from(activeJobs.keys());
  if (jobIds.length === 0) return;

  console.warn(`Marking ${jobIds.length} active job(s) as failed: ${reason}`);

  const apiUrl = process.env.WORKERS_API_URL;
  const secret = process.env.INTERNAL_API_SECRET;

  if (!apiUrl || !secret) {
    console.error('Cannot notify API of shutdown — missing WORKERS_API_URL or INTERNAL_API_SECRET');
    return;
  }

  const client = new CallbackClient(apiUrl, secret);

  await Promise.allSettled(
    jobIds.map((jobId) =>
      client.updateProgress(jobId, {
        status: 'failed',
        progress: 0,
        currentStage: 'failed',
        errorCode: 'SERVICE_SHUTDOWN',
        errorMessage: reason,
      })
    )
  );

  // Clean up audio stores
  for (const jobId of jobIds) {
    audioStore.clear(jobId);
    activeJobs.delete(jobId);
  }
}

/**
 * Run the full generation pipeline using the Agent SDK.
 */
async function generateContent(request: GenerateRequest): Promise<void> {
  const { jobId } = request;

  console.info(
    `Starting generation: ${jobId} (type: ${request.contentType}${request.resumeStage ? `, resume: ${request.resumeStage}` : ''})`
  );

  const toolServer = createToolServer();
  const userPrompt = buildUserPrompt(request);

  const model = process.env.LLM_MODEL || 'deepseek-v3.1';

  const env: Record<string, string> = {};
  if (process.env.CODEBUDDY_API_KEY) {
    env.CODEBUDDY_API_KEY = process.env.CODEBUDDY_API_KEY;
  }
  if (process.env.CODEBUDDY_INTERNET_ENVIRONMENT) {
    env.CODEBUDDY_INTERNET_ENVIRONMENT = process.env.CODEBUDDY_INTERNET_ENVIRONMENT;
  }

  const q = query({
    prompt: userPrompt,
    options: {
      model,
      systemPrompt: VOICE_AGENT_SYSTEM_PROMPT,
      maxTurns: 200,
      permissionMode: 'bypassPermissions',
      env,
      mcpServers: {
        'voice-tools': toolServer,
      },
      settingSources: [],
      allowedTools: [
        'mcp__voice-tools__extract_content',
        'mcp__voice-tools__generate_tts_segment',
        'mcp__voice-tools__batch_generate_tts',
        'mcp__voice-tools__report_progress',
        'mcp__voice-tools__save_script',
        'mcp__voice-tools__assemble_audio',
        'mcp__voice-tools__upload_audio',
      ],
    },
  });

  try {
    for await (const message of q) {
      if (message.type === 'assistant') {
        const textBlocks = message.message.content.filter(
          (b: { type: string }) => b.type === 'text'
        );
        for (const block of textBlocks) {
          if ('text' in block) {
            console.info(`[${jobId}] Agent: ${(block.text as string).slice(0, 200)}`);
          }
        }
      } else if (message.type === 'result') {
        if (message.subtype === 'success') {
          console.info(
            `[${jobId}] Generation completed. Cost: $${message.total_cost_usd}, Turns: ${message.num_turns}`
          );
        } else {
          console.error(
            `[${jobId}] Generation ended with: ${message.subtype}`,
            'errors' in message ? message.errors : ''
          );

          try {
            const client = new CallbackClient(
              process.env.WORKERS_API_URL!,
              process.env.INTERNAL_API_SECRET!
            );
            await client.updateProgress(jobId, {
              status: 'failed',
              progress: 0,
              currentStage: 'failed',
              errorCode: 'AGENT_ERROR',
              errorMessage: `Agent stopped: ${message.subtype}`,
            });
          } catch {
            // Best effort
          }
        }
      }
    }
  } catch (error) {
    console.error(`[${jobId}] Agent SDK error:`, error);

    try {
      const client = new CallbackClient(
        process.env.WORKERS_API_URL!,
        process.env.INTERNAL_API_SECRET!
      );
      await client.updateProgress(jobId, {
        status: 'failed',
        progress: 0,
        currentStage: 'failed',
        errorCode: 'SDK_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown SDK error',
      });
    } catch {
      // Best effort
    }
  } finally {
    audioStore.clear(jobId);
    console.info(`[${jobId}] AudioStore cleared.`);
  }
}

/**
 * Check if a job generation is currently active.
 */
export function isGenerating(jobId: string): boolean {
  return activeJobs.has(jobId);
}
