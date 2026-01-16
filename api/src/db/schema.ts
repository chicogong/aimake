/**
 * AIMake Database Schema
 * Database: Cloudflare D1 (SQLite)
 * ORM: Drizzle
 */

import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// ============ Users 用户表 ============
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(), // UUID
    clerkId: text('clerk_id').notNull().unique(),
    email: text('email').notNull().unique(),
    name: text('name'),
    avatarUrl: text('avatar_url'),

    // 套餐信息
    plan: text('plan', { enum: ['free', 'pro', 'team'] })
      .notNull()
      .default('free'),
    quotaLimit: integer('quota_limit').notNull().default(600), // 秒 (10分钟)
    quotaUsed: integer('quota_used').notNull().default(0),
    quotaResetAt: text('quota_reset_at'), // ISO 8601

    // Stripe 信息
    stripeCustomerId: text('stripe_customer_id'),

    // 时间戳
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    clerkIdIdx: index('idx_users_clerk_id').on(table.clerkId),
    emailIdx: index('idx_users_email').on(table.email),
  })
);

// ============ Voices 音色表 ============
export const voices = sqliteTable('voices', {
  id: text('id').primaryKey(), // 如 'openai-alloy'
  name: text('name').notNull(),
  nameZh: text('name_zh'),
  provider: text('provider', {
    enum: ['openai', 'elevenlabs', 'azure', 'tencent', 'minimax', 'siliconflow'],
  }).notNull(),

  // 属性
  gender: text('gender', { enum: ['male', 'female', 'neutral'] }),
  language: text('language').default('zh-CN'),
  style: text('style'),
  description: text('description'),

  // 资源
  previewUrl: text('preview_url'),
  avatarUrl: text('avatar_url'),

  // 权限
  isPremium: integer('is_premium', { mode: 'boolean' }).notNull().default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // 排序
  sortOrder: integer('sort_order').default(0),

  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ============ Audios 音频记录表 ============
export const audios = sqliteTable(
  'audios',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // 内容
    title: text('title'),
    text: text('text').notNull(),
    textLength: integer('text_length').notNull(),

    // 音频信息
    voiceId: text('voice_id').references(() => voices.id),
    audioUrl: text('audio_url').notNull(),
    audioFormat: text('audio_format', { enum: ['mp3', 'wav'] })
      .notNull()
      .default('mp3'),
    duration: real('duration').notNull(), // 秒
    fileSize: integer('file_size'), // 字节

    // 参数
    speed: real('speed').default(1.0),
    pitch: real('pitch').default(0),

    // 类型
    type: text('type', { enum: ['tts', 'podcast'] })
      .notNull()
      .default('tts'),

    // 状态
    isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),

    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_audios_user_id').on(table.userId),
    createdAtIdx: index('idx_audios_created_at').on(table.createdAt),
    typeIdx: index('idx_audios_type').on(table.type),
  })
);

// ============ TTS Jobs 任务表 ============
export const ttsJobs = sqliteTable(
  'tts_jobs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    audioId: text('audio_id').references(() => audios.id),

    // 输入
    text: text('text').notNull(),
    voiceId: text('voice_id').notNull(),
    speed: real('speed').default(1.0),
    pitch: real('pitch').default(0),
    format: text('format', { enum: ['mp3', 'wav'] })
      .notNull()
      .default('mp3'),

    // 状态
    status: text('status', { enum: ['pending', 'processing', 'completed', 'failed'] })
      .notNull()
      .default('pending'),
    progress: integer('progress').default(0),

    // 错误信息
    errorCode: text('error_code'),
    errorMessage: text('error_message'),

    // 时间
    startedAt: text('started_at'),
    completedAt: text('completed_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_tts_jobs_user_id').on(table.userId),
    statusIdx: index('idx_tts_jobs_status').on(table.status),
  })
);

// ============ Podcasts 播客表 ============
export const podcasts = sqliteTable(
  'podcasts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // 输入
    title: text('title'),
    sourceType: text('source_type', { enum: ['url', 'text', 'topic'] }).notNull(),
    sourceContent: text('source_content').notNull(),
    targetDuration: integer('target_duration').default(600), // 秒
    style: text('style', { enum: ['casual', 'professional', 'debate'] }).default('casual'),

    // 脚本 (JSON)
    script: text('script'), // JSON string

    // 音色配置
    hostVoiceId: text('host_voice_id').references(() => voices.id),
    guestVoiceId: text('guest_voice_id').references(() => voices.id),

    // 输出
    audioUrl: text('audio_url'),
    duration: real('duration'),

    // 状态
    status: text('status', {
      enum: ['pending', 'analyzing', 'scripting', 'synthesizing', 'completed', 'failed'],
    })
      .notNull()
      .default('pending'),

    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_podcasts_user_id').on(table.userId),
    statusIdx: index('idx_podcasts_status').on(table.status),
  })
);

// ============ Subscriptions 订阅表 ============
export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),

    // 套餐
    plan: text('plan', { enum: ['pro', 'team'] }).notNull(),
    status: text('status', { enum: ['active', 'canceled', 'past_due', 'expired'] }).notNull(),

    // Stripe
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripePriceId: text('stripe_price_id'),

    // 时间
    currentPeriodStart: text('current_period_start'),
    currentPeriodEnd: text('current_period_end'),
    cancelAt: text('cancel_at'),
    canceledAt: text('canceled_at'),

    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_subscriptions_user_id').on(table.userId),
  })
);

// ============ Usage Logs 用量日志表 ============
export const usageLogs = sqliteTable(
  'usage_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // 用量信息
    type: text('type', { enum: ['tts', 'podcast'] }).notNull(),
    charsUsed: integer('chars_used').notNull(),
    durationUsed: real('duration_used').notNull(), // 秒

    // 关联
    audioId: text('audio_id').references(() => audios.id),
    podcastId: text('podcast_id').references(() => podcasts.id),

    // API 成本
    provider: text('provider'),
    apiCost: real('api_cost'),

    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index('idx_usage_logs_user_id').on(table.userId),
    createdAtIdx: index('idx_usage_logs_created_at').on(table.createdAt),
  })
);

// ============ Type Exports ============
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Voice = typeof voices.$inferSelect;
export type Audio = typeof audios.$inferSelect;
export type NewAudio = typeof audios.$inferInsert;
export type TTSJob = typeof ttsJobs.$inferSelect;
export type NewTTSJob = typeof ttsJobs.$inferInsert;
export type Podcast = typeof podcasts.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type UsageLog = typeof usageLogs.$inferSelect;
