/**
 * Direct TTS API client for segment generation
 * Provider: SiliconFlow (FishAudio)
 */

const SILICONFLOW_CONFIG = {
  baseUrl: 'https://api.siliconflow.cn/v1/audio/speech',
  model: 'fnlp/MOSS-TTSD-v0.5',
} as const;

interface TTSConfig {
  siliconflowApiKey?: string;
}

function stripVoicePrefix(voiceId: string): string {
  return voiceId
    .replace('sf-', '')
    .replace('siliconflow-', '')
    .replace('fish-', '');
}

const MP3_BITRATES: Record<number, number[]> = {
  // MPEG1 Layer 3
  1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
  // MPEG2/2.5 Layer 3
  2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0],
};

const MP3_SAMPLE_RATES: Record<number, number[]> = {
  1: [44100, 48000, 32000, 0], // MPEG1
  2: [22050, 24000, 16000, 0], // MPEG2
  3: [11025, 12000, 8000, 0],  // MPEG2.5
};

function calculateMp3Duration(buf: Buffer): number {
  let offset = 0;
  let totalSamples = 0;
  let sampleRate = 0;

  // Skip ID3v2 tag if present
  if (buf.length >= 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const size =
      ((buf[6] & 0x7f) << 21) |
      ((buf[7] & 0x7f) << 14) |
      ((buf[8] & 0x7f) << 7) |
      (buf[9] & 0x7f);
    offset = 10 + size;
  }

  while (offset + 4 < buf.length) {
    // Find sync word
    if (buf[offset] !== 0xff || (buf[offset + 1] & 0xe0) !== 0xe0) {
      offset++;
      continue;
    }

    const header = buf.readUInt32BE(offset);
    const mpegVersion = (header >> 19) & 0x03; // 0=2.5, 2=2, 3=1
    const layer = (header >> 17) & 0x03;        // 1=Layer3
    const bitrateIdx = (header >> 12) & 0x0f;
    const sampleRateIdx = (header >> 10) & 0x03;
    const padding = (header >> 9) & 0x01;

    if (layer !== 1 || bitrateIdx === 0 || bitrateIdx === 15 || sampleRateIdx === 3) {
      offset++;
      continue;
    }

    const versionKey = mpegVersion === 3 ? 1 : mpegVersion === 2 ? 2 : 3;
    const bitrateTable = mpegVersion === 3 ? MP3_BITRATES[1] : MP3_BITRATES[2];
    const bitrate = bitrateTable[bitrateIdx] * 1000;
    const sr = MP3_SAMPLE_RATES[versionKey]?.[sampleRateIdx];

    if (!bitrate || !sr) {
      offset++;
      continue;
    }

    sampleRate = sr;
    const samplesPerFrame = mpegVersion === 3 ? 1152 : 576;
    totalSamples += samplesPerFrame;

    const frameSize = Math.floor((samplesPerFrame * bitrate) / (8 * sr)) + padding;
    if (frameSize < 1) {
      offset++;
      continue;
    }
    offset += frameSize;
  }

  if (sampleRate === 0 || totalSamples === 0) {
    // Fallback: estimate from file size assuming 128kbps
    return Math.round((buf.length * 8) / 128000);
  }

  return Math.round((totalSamples / sampleRate) * 10) / 10;
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

    const apiKey = this.config.siliconflowApiKey;
    if (!apiKey) {
      throw new Error('SiliconFlow API key not configured');
    }

    const voice = stripVoicePrefix(voiceId);
    const voiceParam = `${SILICONFLOW_CONFIG.model}:${voice}`;

    const response = await fetch(SILICONFLOW_CONFIG.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: SILICONFLOW_CONFIG.model,
        input: text,
        voice: voiceParam,
        speed,
        response_format: format,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      throw new Error(`TTS API error (siliconflow): ${response.status} — ${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(buffer);
    const audioBase64 = audioBuffer.toString('base64');

    const duration = calculateMp3Duration(audioBuffer);

    return { audioBase64, duration };
  }
}
