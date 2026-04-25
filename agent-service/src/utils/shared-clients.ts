/**
 * Shared, configured clients used across agent tools.
 * Must be initialized at startup via {@link initSharedClients}.
 */

import { CallbackClient } from './callback-client.js';
import { TTSClient } from './tts-client.js';
import type { ServiceConfig } from '../types.js';

let config: ServiceConfig | null = null;
let callbackClient: CallbackClient | null = null;
let ttsClient: TTSClient | null = null;

export function initSharedClients(cfg: ServiceConfig): void {
  config = cfg;
  callbackClient = new CallbackClient(cfg.workersApiUrl, cfg.internalApiSecret);
  ttsClient = new TTSClient({ siliconflowApiKey: cfg.siliconflowApiKey });
}

export function getServiceConfig(): ServiceConfig {
  if (!config) {
    throw new Error('Agent service not initialized — call initSharedClients() before use');
  }
  return config;
}

export function getCallbackClient(): CallbackClient {
  if (!callbackClient) {
    throw new Error('Agent service not initialized — call initSharedClients() before use');
  }
  return callbackClient;
}

export function getTTSClient(): TTSClient {
  if (!ttsClient) {
    throw new Error('Agent service not initialized — call initSharedClients() before use');
  }
  return ttsClient;
}
