/**
 * Shared clients used across agent tools.
 * Provides singleton access to CallbackClient and TTSClient.
 */

import { CallbackClient } from './callback-client.js';
import { TTSClient } from './tts-client.js';

let callbackClientInstance: CallbackClient | null = null;
let ttsClientInstance: TTSClient | null = null;

export function getCallbackClient(): CallbackClient {
  if (!callbackClientInstance) {
    const baseUrl = process.env.WORKERS_API_URL;
    const secret = process.env.INTERNAL_API_SECRET;
    if (!baseUrl || !secret) {
      throw new Error('WORKERS_API_URL and INTERNAL_API_SECRET must be set');
    }
    callbackClientInstance = new CallbackClient(baseUrl, secret);
  }
  return callbackClientInstance;
}

export function getTTSClient(): TTSClient {
  if (!ttsClientInstance) {
    ttsClientInstance = new TTSClient({
      siliconflowApiKey: process.env.SILICONFLOW_API_KEY,
    });
  }
  return ttsClientInstance;
}
