/**
 * Voice Routes
 * GET /api/voices - Get available voices
 * GET /api/voices/:id/preview - Get voice preview
 */

import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { success } from '../utils/response';
import { errors } from '../middleware/error';

const voicesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// Static voice list - no database dependency for MVP
const VOICES = [
  // OpenAI voices
  {
    id: 'openai-alloy',
    name: 'Alloy',
    nameZh: '合金',
    provider: 'openai',
    gender: 'neutral',
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
    provider: 'openai',
    gender: 'male',
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
    provider: 'openai',
    gender: 'female',
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
    provider: 'openai',
    gender: 'male',
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
    provider: 'openai',
    gender: 'female',
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
    provider: 'openai',
    gender: 'female',
    language: 'zh-CN',
    style: '清新女声',
    description: '清新的女性声音，适合教育内容',
    isPremium: false,
    isActive: true,
    sortOrder: 6,
  },
  // SiliconFlow FishAudio voices
  {
    id: 'sf-alex',
    name: 'Alex',
    nameZh: '艾利克斯',
    provider: 'siliconflow',
    gender: 'male',
    language: 'zh-CN',
    style: '稳重男声',
    description: 'FishAudio 稳重男声，适合新闻播报',
    isPremium: false,
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'sf-benjamin',
    name: 'Benjamin',
    nameZh: '本杰明',
    provider: 'siliconflow',
    gender: 'male',
    language: 'zh-CN',
    style: '温暖男声',
    description: 'FishAudio 温暖男声，适合叙述',
    isPremium: false,
    isActive: true,
    sortOrder: 21,
  },
  {
    id: 'sf-charles',
    name: 'Charles',
    nameZh: '查尔斯',
    provider: 'siliconflow',
    gender: 'male',
    language: 'zh-CN',
    style: '磁性男声',
    description: 'FishAudio 磁性男声，适合广告配音',
    isPremium: false,
    isActive: true,
    sortOrder: 22,
  },
  {
    id: 'sf-david',
    name: 'David',
    nameZh: '大卫',
    provider: 'siliconflow',
    gender: 'male',
    language: 'zh-CN',
    style: '成熟男声',
    description: 'FishAudio 成熟男声',
    isPremium: false,
    isActive: true,
    sortOrder: 23,
  },
  {
    id: 'sf-anna',
    name: 'Anna',
    nameZh: '安娜',
    provider: 'siliconflow',
    gender: 'female',
    language: 'zh-CN',
    style: '甜美女声',
    description: 'FishAudio 甜美女声，自然流畅',
    isPremium: false,
    isActive: true,
    sortOrder: 24,
  },
  {
    id: 'sf-bella',
    name: 'Bella',
    nameZh: '贝拉',
    provider: 'siliconflow',
    gender: 'female',
    language: 'zh-CN',
    style: '活泼女声',
    description: 'FishAudio 活泼女声',
    isPremium: false,
    isActive: true,
    sortOrder: 25,
  },
  {
    id: 'sf-claire',
    name: 'Claire',
    nameZh: '克莱尔',
    provider: 'siliconflow',
    gender: 'female',
    language: 'zh-CN',
    style: '温柔女声',
    description: 'FishAudio 温柔女声，适合有声读物',
    isPremium: false,
    isActive: true,
    sortOrder: 26,
  },
  {
    id: 'sf-diana',
    name: 'Diana',
    nameZh: '黛安娜',
    provider: 'siliconflow',
    gender: 'female',
    language: 'zh-CN',
    style: '清新女声',
    description: 'FishAudio 清新女声，适合教育内容',
    isPremium: false,
    isActive: true,
    sortOrder: 27,
  },
];

// GET /api/voices - Get all active voices
voicesRouter.get('/', async (c) => {
  const provider = c.req.query('provider');
  const gender = c.req.query('gender');
  const premium = c.req.query('premium');

  // Filter voices based on query params
  let voiceList = VOICES.filter((v) => v.isActive);

  if (provider) {
    voiceList = voiceList.filter((v) => v.provider === provider);
  }

  if (gender) {
    voiceList = voiceList.filter((v) => v.gender === gender);
  }

  if (premium !== undefined) {
    voiceList = voiceList.filter((v) => v.isPremium === (premium === 'true'));
  }

  // Sort by sortOrder
  voiceList.sort((a, b) => a.sortOrder - b.sortOrder);

  // Transform to API response format
  const result = voiceList.map((v) => ({
    id: v.id,
    name: v.name,
    nameZh: v.nameZh,
    provider: v.provider,
    gender: v.gender,
    language: [v.language],
    style: v.style,
    previewUrl: null,
    isPremium: v.isPremium,
    tags: v.style ? [v.style] : [],
  }));

  return success(c, result);
});

// GET /api/voices/:id/preview - Get voice preview audio URL
voicesRouter.get('/:id/preview', async (c) => {
  const { id } = c.req.param();

  const voice = VOICES.find((v) => v.id === id && v.isActive);

  if (!voice) {
    throw errors.notFound('音色不存在');
  }

  // No preview URL for now
  return success(c, {
    id: voice.id,
    name: voice.name,
    previewUrl: null,
  });
});

export default voicesRouter;
