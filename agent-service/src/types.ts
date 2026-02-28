/**
 * Shared types for the agent service
 */

// ============ Request from Workers API ============

export type ContentType = 'auto' | 'podcast' | 'audiobook' | 'voiceover' | 'education' | 'tts';

export interface GenerateRequest {
  jobId: string;
  source: {
    type: 'text' | 'url' | 'document';
    content: string;
    documentId?: string;
  };
  contentType: ContentType;
  settings: {
    episodeDuration: number; // minutes
    style?: string;
    language?: 'zh' | 'en';
    voices: Array<{ role: string; voiceId: string }>;
  };
  title?: string;
  callbackUrl: string;
}

// ============ Script Types ============

export interface ScriptSegment {
  index: number;
  speaker: string; // 'host'|'guest'|'narrator'|'teacher'|'student'
  text: string;
  emotion?: string;
  speed?: number;
}

export interface GeneratedScript {
  title: string;
  segments: ScriptSegment[];
  estimatedDuration: number; // seconds
}

// ============ Tool Outputs ============

export interface ExtractedContent {
  title: string | null;
  text: string;
  charCount: number;
  language: 'zh' | 'en';
}

export interface TTSSegmentResult {
  index: number;
  audioBase64: string;
  duration: number;
}

export interface AssembledAudio {
  audioBase64: string;
  totalDuration: number;
}

// ============ Progress ============

export type JobStage =
  | 'classifying'
  | 'extracting'
  | 'analyzing'
  | 'scripting'
  | 'synthesizing'
  | 'assembling'
  | 'completed'
  | 'failed';

export interface ProgressUpdate {
  stage: JobStage;
  progress: number;
  message?: string;
}

// ============ Callback Payloads ============

export interface ProgressCallbackPayload {
  status: JobStage;
  progress: number;
  currentStage: string;
  detectedContentType?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface ScriptCallbackPayload {
  script: string;
  title?: string;
}

export interface AudioCallbackPayload {
  audioBase64: string;
  duration: number;
  format: string;
}

// ============ Environment ============

export interface ServiceConfig {
  codebuddyApiKey: string;
  llmModel: string;
  siliconflowApiKey?: string;
  workersApiUrl: string;
  internalApiSecret: string;
  port: number;
}

export function loadConfig(): ServiceConfig {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  };

  return {
    codebuddyApiKey: required('CODEBUDDY_API_KEY'),
    llmModel: process.env.LLM_MODEL || 'deepseek-v3.1',
    siliconflowApiKey: process.env.SILICONFLOW_API_KEY,
    workersApiUrl: required('WORKERS_API_URL'),
    internalApiSecret: required('INTERNAL_API_SECRET'),
    port: parseInt(process.env.PORT || '3001', 10),
  };
}
