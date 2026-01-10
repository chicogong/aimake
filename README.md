# AIMake - AI 语音内容生成

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-25%20files-green.svg)](docs/)
[![Status](https://img.shields.io/badge/status-planning-yellow.svg)](#项目状态)

> 用 AI 快速生成播客、有声书、配音、教育内容

---

## 项目状态

**📋 规划期** - 文档完成，代码开发中

- ✅ 产品规划文档（7 个）
- ✅ 技术设计文档（14 个）
- ✅ 开发运维文档（4 个）
- ✅ 环境配置模板
- ⏳ 前端开发（待开始）
- ⏳ 后端开发（待开始）

---

## 产品定位

**输入文字，获得专业音频。**

不需要录音设备，不需要配音演员，几秒内生成高质量语音内容。

---

## 核心功能

| 功能           | 描述                   |
| -------------- | ---------------------- |
| **文本转语音** | 输入文字，一键生成音频 |
| **多音色**     | 10+ 种自然音色可选     |
| **对话生成**   | 输入话题，生成双人播客 |
| **长文转音频** | 文章/小说转有声书      |
| **视频配音**   | 为短视频快速配音       |

---

## 目标用户

- 内容创作者 (播客、YouTube、B站)
- 知识博主 (公众号、知乎)
- 短视频作者 (抖音、快手)
- 教育从业者 (在线课程)
- 独立开发者 (产品演示)

---

## 📚 文档

完整的技术文档位于 `docs/` 目录：

### 产品与规划

- 📖 **[文档索引](./docs/README.md)** - 完整文档导航
- 🎯 **[产品规划](./docs/planning/product-plan.md)** - 功能、定价、开发计划
- 🤖 **[AI 供应商选型](./docs/planning/ai-providers-overview.md)** - TTS/LLM/ASR 快速决策
- 🎙️ [TTS 供应商对比](./docs/planning/tts-providers-comparison.md)
- 💬 [LLM & ASR 接入](./docs/planning/llm-asr-providers.md)

### 技术设计

- 🏗️ [系统架构](./docs/design/design-research.md)
- 🔌 [API 设计](./docs/design/api-design.md)
- 💾 [数据库设计](./docs/design/database-schema.md)
- ⚛️ [前端架构](./docs/design/frontend-architecture.md)

### 开发运维

- ⚙️ **[环境配置](./docs/development/env-config.md)** - 环境变量完整说明
- 🚀 [部署架构](./docs/development/deployment-architecture.md)
- ✅ [上线验证](./docs/development/release-verification.md)

---

## 快速开始

### 1. 环境变量配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入必需的 API Keys:
# - VITE_CLERK_PUBLISHABLE_KEY (认证)
# - TENCENT_SECRET_ID / TENCENT_SECRET_KEY (TTS)
# - LLM_API_KEY (播客脚本生成)
#
# 详见 .env.example 文件中的注释说明
```

📄 **完整的配置说明**: [.env.example](./.env.example) |
[环境配置文档](./docs/development/env-config.md)

### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../api
npm install
```

### 3. 启动开发服务器

```bash
# 在项目根目录
npm run dev

# 或分别启动
npm run dev:frontend  # http://localhost:5173
npm run dev:api       # http://localhost:8787
```

---

## 技术栈

| 类别 | 技术                                     |
| ---- | ---------------------------------------- |
| 前端 | React 18, TypeScript, Vite, Tailwind CSS |
| 后端 | Cloudflare Workers, Hono, D1, R2, KV     |
| TTS  | 腾讯云 / Google / Azure / OpenAI         |
| LLM  | 硅基流动 / DeepSeek / 智谱 AI            |
| 认证 | Clerk                                    |
| 支付 | Stripe                                   |

---

## 定价

| 套餐 | 价格   | 额度        |
| ---- | ------ | ----------- |
| 免费 | $0     | 10 分钟/月  |
| Pro  | $19/月 | 300 分钟/月 |
| 团队 | $99/月 | 无限        |

---

## License

MIT
