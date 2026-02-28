/**
 * Direct TTS API client for segment generation
 */

const PROVIDERS = {
  openai: {
    baseUrl: 'https://api.openai.com/v1/audio/speech',
    model: 'tts-1',
  },
  siliconflow: {
    baseUrl: 'https://api.siliconflow.cn/v1/audio/speech',
    model: 'fnlp/MOSS-TTSD-v0.5',
  },
} as const;

type Provider = 'openai' | 'siliconflow';

interface TTSConfig {
  openaiApiKey?: string;
  siliconflowApiKey?: string;
}

function resolveProvider(voiceId: string): Provider {
  if (voiceId.startsWith('openai-')) return 'openai';
  return 'siliconflow';
}

function stripVoicePrefix(voiceId: string): string {
  return voiceId
    .replace('openai-', '')
    .replace('sf-', '')
    .replace('siliconflow-', '')
    .replace('fish-', '');
}

export class TTSClient {
  constructor(private config: TTSConfig) {}

  async generateSegment(params: {
    text: string;
    voiceId: string;
    speed?: number;
    format?: string;
  }): Promise<{ audioBase64: string; duration: number }> {
    const { text, voiceId, speed = 1.0, format = 'mp3' } = params;

    let provider = resolveProvider(voiceId);

    if (provider === 'openai' && !this.config.openaiApiKey) {
      console.warn('OpenAI API key not configured, falling back to SiliconFlow');
      provider = 'siliconflow';
    }

    const apiKey =
      provider === 'openai' ? this.config.openaiApiKey : this.config.siliconflowApiKey;

    if (!apiKey) {
      throw new Error(`${provider} API key not configured`);
    }

    const voice = stripVoicePrefix(voiceId);
    const providerConfig = PROVIDERS[provider];

    const voiceParam =
      provider === 'siliconflow' ? `${providerConfig.model}:${voice}` : voice;

    const response = await fetch(providerConfig.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: providerConfig.model,
        input: text,
        voice: voiceParam,
        speed,
        response_format: format,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      throw new Error(`TTS API error (${provider}): ${response.status} — ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(buffer).toString('base64');

    const charCount = text.length;
    const estimatedDuration = Math.ceil(charCount / 150) / speed;

    return { audioBase64, duration: estimatedDuration };
  }
}
