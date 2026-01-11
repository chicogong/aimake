/**
 * Voice Routes
 * GET /api/voices - Get available voices
 * GET /api/voices/:id/preview - Get voice preview
 */

import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { createDb, voices } from '../db';
import { success } from '../utils/response';
import { errors } from '../middleware/error';

const voicesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/voices - Get all active voices
voicesRouter.get('/', async (c) => {
  const provider = c.req.query('provider');
  const gender = c.req.query('gender');
  const premium = c.req.query('premium');

  const db = createDb(c.env.DB);

  // Build conditions for filtering

  // Apply filters
  const conditions = [eq(voices.isActive, true)];

  if (provider) {
    conditions.push(
      eq(voices.provider, provider as 'openai' | 'elevenlabs' | 'azure' | 'tencent' | 'minimax')
    );
  }

  if (gender) {
    conditions.push(eq(voices.gender, gender as 'male' | 'female' | 'neutral'));
  }

  if (premium !== undefined) {
    conditions.push(eq(voices.isPremium, premium === 'true'));
  }

  const result = await db
    .select()
    .from(voices)
    .where(and(...conditions))
    .orderBy(voices.sortOrder);

  // Transform to API response format
  const voiceList = result.map((v) => ({
    id: v.id,
    name: v.name,
    nameZh: v.nameZh,
    provider: v.provider,
    gender: v.gender,
    language: v.language ? [v.language] : ['zh-CN'],
    style: v.style,
    previewUrl: v.previewUrl,
    isPremium: v.isPremium,
    tags: v.style ? [v.style] : [],
  }));

  return success(c, voiceList);
});

// GET /api/voices/:id/preview - Get voice preview audio URL
voicesRouter.get('/:id/preview', async (c) => {
  const { id } = c.req.param();

  const db = createDb(c.env.DB);
  const [voice] = await db
    .select()
    .from(voices)
    .where(and(eq(voices.id, id), eq(voices.isActive, true)))
    .limit(1);

  if (!voice) {
    throw errors.notFound('音色不存在');
  }

  if (!voice.previewUrl) {
    throw errors.notFound('预览音频不存在');
  }

  return success(c, {
    id: voice.id,
    name: voice.name,
    previewUrl: voice.previewUrl,
  });
});

export default voicesRouter;

// ============ Seed Voices Data ============
// This should be run during database setup

export const seedVoices = [
  {
    id: 'openai-alloy',
    name: 'Alloy',
    nameZh: '合金',
    provider: 'openai' as const,
    gender: 'neutral' as const,
    language: 'zh-CN',
    style: '平稳专业',
    description: '中性、平稳的声音，适合新闻播报和专业场景',
    isPremium: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'openai-echo',
    name: 'Echo',
    nameZh: '回声',
    provider: 'openai' as const,
    gender: 'male' as const,
    language: 'zh-CN',
    style: '温暖男声',
    description: '温暖的男性声音，适合叙述和讲故事',
    isPremium: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'openai-fable',
    name: 'Fable',
    nameZh: '寓言',
    provider: 'openai' as const,
    gender: 'female' as const,
    language: 'zh-CN',
    style: '活泼女声',
    description: '活泼的女性声音，适合轻松内容',
    isPremium: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'openai-onyx',
    name: 'Onyx',
    nameZh: '玛瑙',
    provider: 'openai' as const,
    gender: 'male' as const,
    language: 'zh-CN',
    style: '磁性男声',
    description: '低沉磁性的男性声音，适合配音和广告',
    isPremium: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'openai-nova',
    name: 'Nova',
    nameZh: '新星',
    provider: 'openai' as const,
    gender: 'female' as const,
    language: 'zh-CN',
    style: '温柔女声',
    description: '温柔的女性声音，适合有声读物',
    isPremium: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'openai-shimmer',
    name: 'Shimmer',
    nameZh: '微光',
    provider: 'openai' as const,
    gender: 'female' as const,
    language: 'zh-CN',
    style: '清新女声',
    description: '清新的女性声音，适合教育内容',
    isPremium: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'tencent-zhixiaoxia',
    name: 'Zhixiaoxia',
    nameZh: '智小夏',
    provider: 'tencent' as const,
    gender: 'female' as const,
    language: 'zh-CN',
    style: '甜美女声',
    description: '腾讯云甜美女声，自然流畅',
    isPremium: false,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'tencent-zhixiaoqian',
    name: 'Zhixiaoqian',
    nameZh: '智小倩',
    provider: 'tencent' as const,
    gender: 'female' as const,
    language: 'zh-CN',
    style: '温柔女声',
    description: '腾讯云温柔女声',
    isPremium: false,
    isActive: true,
    sortOrder: 11,
  },
];
