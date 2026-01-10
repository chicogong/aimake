# AIMake 数据库 Schema 设计

> 创建日期: 2026-01-09数据库: PostgreSQL 15+

---

## 一、ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │   audios    │       │   voices    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │   ┌──│ id (PK)     │
│ email       │  │    │ user_id(FK) │←──┤  │ name        │
│ password    │  └───→│ voice_id(FK)│───┘  │ provider    │
│ plan        │       │ text        │       │ preview_url │
│ quota_used  │       │ audio_url   │       │ is_premium  │
│ created_at  │       │ duration    │       └─────────────┘
└─────────────┘       │ type        │
       │              │ created_at  │
       │              └─────────────┘
       │
       │         ┌─────────────┐       ┌─────────────┐
       │         │  podcasts   │       │ podcast_jobs│
       │         ├─────────────┤       ├─────────────┤
       └────────→│ id (PK)     │←──────│ id (PK)     │
                 │ user_id(FK) │       │ podcast_id  │
                 │ title       │       │ status      │
                 │ source_text │       │ progress    │
                 │ script      │       │ error       │
                 │ audio_url   │       │ created_at  │
                 │ duration    │       └─────────────┘
                 │ host_voice  │
                 │ guest_voice │
                 └─────────────┘

┌─────────────┐       ┌─────────────┐
│subscriptions│       │usage_logs   │
├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │
│ user_id(FK) │       │ user_id(FK) │
│ plan        │       │ type        │
│ status      │       │ chars_used  │
│ stripe_id   │       │ audio_id    │
│ start_date  │       │ created_at  │
│ end_date    │       └─────────────┘
└─────────────┘
```

---

## 二、表结构详细设计

### 2.1 users - 用户表

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),  -- NULL if OAuth login
    name            VARCHAR(100),
    avatar_url      VARCHAR(500),

    -- 套餐信息
    plan            VARCHAR(20) DEFAULT 'free',  -- free, pro, team
    quota_limit     INTEGER DEFAULT 600,         -- 秒 (10分钟=600秒)
    quota_used      INTEGER DEFAULT 0,           -- 本月已用秒数
    quota_reset_at  TIMESTAMP WITH TIME ZONE,    -- 额度重置时间

    -- OAuth
    google_id       VARCHAR(100),
    github_id       VARCHAR(100),

    -- 状态
    is_active       BOOLEAN DEFAULT true,
    is_verified     BOOLEAN DEFAULT false,

    -- 时间戳
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at   TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
```

### 2.2 voices - 音色表

```sql
CREATE TABLE voices (
    id              VARCHAR(50) PRIMARY KEY,     -- 如 'openai-alloy', 'eleven-rachel'
    name            VARCHAR(100) NOT NULL,       -- 显示名称
    name_zh         VARCHAR(100),                -- 中文名称
    provider        VARCHAR(20) NOT NULL,        -- openai, elevenlabs, azure

    -- 音色属性
    gender          VARCHAR(10),                 -- male, female, neutral
    language        VARCHAR(20) DEFAULT 'zh-CN', -- 主要语言
    style           VARCHAR(50),                 -- news, casual, story
    description     TEXT,

    -- 资源
    preview_url     VARCHAR(500),                -- 试听音频 URL
    avatar_url      VARCHAR(500),                -- 音色头像

    -- 权限
    is_premium      BOOLEAN DEFAULT false,       -- 是否 Pro 专属
    is_active       BOOLEAN DEFAULT true,

    -- 排序
    sort_order      INTEGER DEFAULT 0,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初始数据
INSERT INTO voices (id, name, name_zh, provider, gender, is_premium) VALUES
('openai-alloy', 'Alloy', '小明', 'openai', 'neutral', false),
('openai-echo', 'Echo', '小刚', 'openai', 'male', false),
('openai-fable', 'Fable', '小红', 'openai', 'female', false),
('openai-onyx', 'Onyx', '磁性男', 'openai', 'male', false),
('openai-nova', 'Nova', '温柔女', 'openai', 'female', false),
('openai-shimmer', 'Shimmer', '活力女', 'openai', 'female', false),
('eleven-rachel', 'Rachel', '专业女声', 'elevenlabs', 'female', true),
('eleven-adam', 'Adam', '专业男声', 'elevenlabs', 'male', true);
```

### 2.3 audios - 音频记录表

```sql
CREATE TABLE audios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 内容
    title           VARCHAR(200),                -- 用户自定义标题
    text            TEXT NOT NULL,               -- 原始文本
    text_length     INTEGER NOT NULL,            -- 字符数

    -- 音频信息
    voice_id        VARCHAR(50) REFERENCES voices(id),
    audio_url       VARCHAR(500) NOT NULL,       -- S3 URL
    audio_format    VARCHAR(10) DEFAULT 'mp3',   -- mp3, wav
    duration        DECIMAL(10,2) NOT NULL,      -- 秒
    file_size       INTEGER,                     -- 字节

    -- 参数
    speed           DECIMAL(3,2) DEFAULT 1.0,    -- 0.5-2.0
    emotion         VARCHAR(20) DEFAULT 'neutral',

    -- 类型
    type            VARCHAR(20) DEFAULT 'tts',   -- tts, podcast

    -- 状态
    is_public       BOOLEAN DEFAULT false,
    is_deleted      BOOLEAN DEFAULT false,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_audios_user_id ON audios(user_id);
CREATE INDEX idx_audios_created_at ON audios(created_at DESC);
CREATE INDEX idx_audios_type ON audios(type);
```

### 2.4 podcasts - 播客对话表

```sql
CREATE TABLE podcasts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 输入
    title           VARCHAR(200),
    source_type     VARCHAR(20) NOT NULL,        -- url, text, topic
    source_content  TEXT NOT NULL,               -- URL/文本/主题
    target_duration INTEGER DEFAULT 600,         -- 目标时长(秒)
    style           VARCHAR(50) DEFAULT 'casual', -- casual, formal, debate

    -- 生成的脚本
    script          JSONB,                       -- [{role, text, voice_id}]

    -- 音色配置
    host_voice_id   VARCHAR(50) REFERENCES voices(id),
    guest_voice_id  VARCHAR(50) REFERENCES voices(id),

    -- 输出
    audio_url       VARCHAR(500),
    duration        DECIMAL(10,2),

    -- 状态
    status          VARCHAR(20) DEFAULT 'draft', -- draft, processing, completed, failed

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 脚本 JSONB 结构示例:
-- [
--   {"role": "host", "text": "大家好，欢迎收听...", "voice_id": "openai-alloy"},
--   {"role": "guest", "text": "谢谢邀请，今天...", "voice_id": "openai-nova"},
--   ...
-- ]

CREATE INDEX idx_podcasts_user_id ON podcasts(user_id);
CREATE INDEX idx_podcasts_status ON podcasts(status);
```

### 2.5 podcast_jobs - 播客生成任务表

```sql
CREATE TABLE podcast_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id      UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,

    -- 任务状态
    status          VARCHAR(20) DEFAULT 'pending',
    -- pending, analyzing, scripting, synthesizing, processing, completed, failed

    progress        INTEGER DEFAULT 0,           -- 0-100
    current_step    VARCHAR(50),                 -- 当前步骤描述

    -- 错误信息
    error_code      VARCHAR(50),
    error_message   TEXT,

    -- 时间
    started_at      TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_podcast_jobs_podcast_id ON podcast_jobs(podcast_id);
CREATE INDEX idx_podcast_jobs_status ON podcast_jobs(status);
```

### 2.6 subscriptions - 订阅表

```sql
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 套餐信息
    plan            VARCHAR(20) NOT NULL,        -- pro, team
    status          VARCHAR(20) NOT NULL,        -- active, canceled, past_due, expired

    -- Stripe 信息
    stripe_customer_id      VARCHAR(100),
    stripe_subscription_id  VARCHAR(100),
    stripe_price_id         VARCHAR(100),

    -- 时间
    current_period_start    TIMESTAMP WITH TIME ZONE,
    current_period_end      TIMESTAMP WITH TIME ZONE,
    cancel_at               TIMESTAMP WITH TIME ZONE,
    canceled_at             TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
```

### 2.7 usage_logs - 用量日志表

```sql
CREATE TABLE usage_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- 用量信息
    type            VARCHAR(20) NOT NULL,        -- tts, podcast
    chars_used      INTEGER NOT NULL,            -- 字符数
    duration_used   DECIMAL(10,2) NOT NULL,      -- 秒

    -- 关联
    audio_id        UUID REFERENCES audios(id),
    podcast_id      UUID REFERENCES podcasts(id),

    -- API 成本追踪
    provider        VARCHAR(20),                 -- openai, elevenlabs
    api_cost        DECIMAL(10,6),               -- 美元

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at);

-- 按月汇总视图
CREATE VIEW monthly_usage AS
SELECT
    user_id,
    DATE_TRUNC('month', created_at) AS month,
    SUM(duration_used) AS total_duration,
    SUM(chars_used) AS total_chars,
    COUNT(*) AS total_requests,
    SUM(api_cost) AS total_cost
FROM usage_logs
GROUP BY user_id, DATE_TRUNC('month', created_at);
```

### 2.8 api_keys - API 密钥表 (团队版)

```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    name            VARCHAR(100),                -- 密钥名称
    key_hash        VARCHAR(255) NOT NULL,       -- 哈希后的密钥
    key_prefix      VARCHAR(10) NOT NULL,        -- 前缀用于识别 (如 'ak_xxxx')

    -- 权限
    scopes          VARCHAR[] DEFAULT ARRAY['tts'],  -- tts, podcast, all

    -- 限制
    rate_limit      INTEGER DEFAULT 60,          -- 每分钟请求数

    -- 状态
    is_active       BOOLEAN DEFAULT true,
    last_used_at    TIMESTAMP WITH TIME ZONE,
    expires_at      TIMESTAMP WITH TIME ZONE,

    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
```

---

## 三、常用查询

### 3.1 获取用户音频库

```sql
SELECT
    a.id,
    a.title,
    a.text,
    a.audio_url,
    a.duration,
    a.created_at,
    v.name as voice_name,
    v.avatar_url as voice_avatar
FROM audios a
LEFT JOIN voices v ON a.voice_id = v.id
WHERE a.user_id = $1
  AND a.is_deleted = false
ORDER BY a.created_at DESC
LIMIT $2 OFFSET $3;
```

### 3.2 检查用户额度

```sql
SELECT
    u.plan,
    u.quota_limit,
    u.quota_used,
    u.quota_reset_at,
    (u.quota_limit - u.quota_used) as remaining
FROM users u
WHERE u.id = $1;
```

### 3.3 扣减额度

```sql
UPDATE users
SET
    quota_used = quota_used + $2,
    updated_at = NOW()
WHERE id = $1
  AND (quota_limit - quota_used) >= $2
RETURNING quota_used, quota_limit;
```

### 3.4 月度用量统计

```sql
SELECT
    DATE(created_at) as date,
    COUNT(*) as requests,
    SUM(duration_used) as total_duration,
    SUM(chars_used) as total_chars
FROM usage_logs
WHERE user_id = $1
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY DATE(created_at)
ORDER BY date;
```

### 3.5 重置月度额度 (定时任务)

```sql
UPDATE users
SET
    quota_used = 0,
    quota_reset_at = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
WHERE quota_reset_at <= CURRENT_DATE;
```

---

## 四、数据迁移

### 初始化脚本

```sql
-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 按顺序创建表
-- 1. users
-- 2. voices
-- 3. audios
-- 4. podcasts
-- 5. podcast_jobs
-- 6. subscriptions
-- 7. usage_logs
-- 8. api_keys

-- 插入默认音色
-- (见上方 voices 表)
```

---

## 五、备份策略

| 类型     | 频率   | 保留期 |
| -------- | ------ | ------ |
| 全量备份 | 每日   | 30天   |
| 增量备份 | 每小时 | 7天    |
| WAL 归档 | 实时   | 7天    |

```bash
# 每日备份命令
pg_dump -Fc aimake > /backups/aimake_$(date +%Y%m%d).dump
```

---

_文档持续更新中..._
