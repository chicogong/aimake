/**
 * Universal voice content agent.
 * Uses Agent SDK to orchestrate the full pipeline:
 * Classify → Extract → Analyze → Script → Synthesize → Assemble.
 */

import { query } from '@tencent-ai/agent-sdk';
import { createToolServer } from '../tools/index.js';
import { VOICE_AGENT_SYSTEM_PROMPT, buildUserPrompt } from './system-prompt.js';
import { audioStore } from '../utils/audio-store.js';
import { getCallbackClient, getServiceConfig } from '../utils/shared-clients.js';
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

  const client = getCallbackClient();

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
  const config = getServiceConfig();

  console.info(
    `[${jobId}] starting generation: type=${request.contentType}` +
      (request.resumeStage ? `, resume=${request.resumeStage}` : '')
  );

  const env: Record<string, string> = {
    CODEBUDDY_API_KEY: config.codebuddyApiKey,
  };
  if (process.env.CODEBUDDY_INTERNET_ENVIRONMENT) {
    env.CODEBUDDY_INTERNET_ENVIRONMENT = process.env.CODEBUDDY_INTERNET_ENVIRONMENT;
  }

  const q = query({
    prompt: buildUserPrompt(request),
    options: {
      model: config.llmModel,
      systemPrompt: VOICE_AGENT_SYSTEM_PROMPT,
      maxTurns: 200,
      permissionMode: 'bypassPermissions',
      env,
      mcpServers: { 'voice-tools': createToolServer() },
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
            console.info(`[${jobId}] agent: ${(block.text as string).slice(0, 200)}`);
          }
        }
      } else if (message.type === 'result') {
        if (message.subtype === 'success') {
          console.info(
            `[${jobId}] generation completed. cost=$${message.total_cost_usd}, turns=${message.num_turns}`
          );
        } else {
          await reportFailure(jobId, 'AGENT_ERROR', `Agent stopped: ${message.subtype}`, {
            errors: 'errors' in message ? message.errors : undefined,
          });
        }
      }
    }
  } catch (error) {
    await reportFailure(
      jobId,
      'SDK_ERROR',
      error instanceof Error ? error.message : 'Unknown SDK error',
      { error }
    );
  } finally {
    audioStore.clear(jobId);
    console.info(`[${jobId}] AudioStore cleared.`);
  }
}

/**
 * Report a fatal failure to the API. Logged structurally regardless of callback success
 * so an operator can locate the job even when the API is unreachable.
 */
async function reportFailure(
  jobId: string,
  errorCode: string,
  errorMessage: string,
  context?: Record<string, unknown>
): Promise<void> {
  console.error(
    JSON.stringify({
      level: 'error',
      jobId,
      errorCode,
      errorMessage,
      context,
    })
  );

  try {
    await getCallbackClient().updateProgress(jobId, {
      status: 'failed',
      progress: 0,
      currentStage: 'failed',
      errorCode,
      errorMessage,
    });
  } catch (callbackErr) {
    console.error(
      JSON.stringify({
        level: 'error',
        jobId,
        message: 'failure callback exhausted retries — job will appear stuck until manual intervention',
        callbackError: callbackErr instanceof Error ? callbackErr.message : String(callbackErr),
      })
    );
  }
}

export function isGenerating(jobId: string): boolean {
  return activeJobs.has(jobId);
}
