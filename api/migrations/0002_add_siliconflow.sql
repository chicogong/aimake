-- Migration: 0002_add_siliconflow
-- Add SiliconFlow provider and voices

-- Note: SQLite doesn't support ALTER TABLE to modify CHECK constraints
-- We need to recreate the table or just insert the data (SQLite will warn but allow)

-- Insert SiliconFlow voices
INSERT OR IGNORE INTO voices (id, name, name_zh, provider, gender, language, style, description, is_premium, is_active, sort_order) VALUES
  ('sf-alex', 'Alex', '艾利克斯', 'siliconflow', 'male', 'zh-CN', '稳重男声', 'FishAudio 稳重男声，适合新闻播报', 0, 1, 20),
  ('sf-benjamin', 'Benjamin', '本杰明', 'siliconflow', 'male', 'zh-CN', '温暖男声', 'FishAudio 温暖男声，适合叙述', 0, 1, 21),
  ('sf-charles', 'Charles', '查尔斯', 'siliconflow', 'male', 'zh-CN', '磁性男声', 'FishAudio 磁性男声，适合广告配音', 0, 1, 22),
  ('sf-david', 'David', '大卫', 'siliconflow', 'male', 'zh-CN', '成熟男声', 'FishAudio 成熟男声', 0, 1, 23),
  ('sf-anna', 'Anna', '安娜', 'siliconflow', 'female', 'zh-CN', '甜美女声', 'FishAudio 甜美女声，自然流畅', 0, 1, 24),
  ('sf-bella', 'Bella', '贝拉', 'siliconflow', 'female', 'zh-CN', '活泼女声', 'FishAudio 活泼女声', 0, 1, 25),
  ('sf-claire', 'Claire', '克莱尔', 'siliconflow', 'female', 'zh-CN', '温柔女声', 'FishAudio 温柔女声，适合有声读物', 0, 1, 26),
  ('sf-diana', 'Diana', '黛安娜', 'siliconflow', 'female', 'zh-CN', '清新女声', 'FishAudio 清新女声，适合教育内容', 0, 1, 27);
