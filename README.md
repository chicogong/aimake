# AIMake - AI 语音内容生成平台

> 输入文本或 URL，AI Agent 自动生成播客、有声书、配音、教育音频

## 架构

```
Frontend (React)          API (CF Workers)              Agent Service (Node.js)
localhost:5173            localhost:8787                 localhost:3001
                   REST + Clerk JWT          HTTP POST /generate
  CreatePage ──────────────► /api/jobs ──────────────────► voice-agent
  JobDetailPage ◄── SSE ─── /api/jobs/:id/stream         (Agent SDK + LLM)
                             /api/internal ◄──── callbacks ──┘
```

三个服务：
- **Frontend** — React + Vite + Tailwind + shadcn/ui
- **API** — Cloudflare Workers + Hono + D1 + R2 + KV
- **Agent Service** — Node.js + @tencent-ai/agent-sdk + SiliconFlow TTS

## 快速开始

```bash
# 1. 安装依赖
cd api && npm install
cd ../agent-service && npm install
cd ../frontend && npm install

# 2. 配置环境变量（参考 .env.example）
# api/.dev.vars — Clerk + SiliconFlow + Internal Secret
# agent-service/.env — LLM + SiliconFlow + Callback URL
# frontend/.env.local — API URL + Clerk Key

# 3. 启动（三个终端）
cd api && npm run dev              # :8787
cd agent-service && npm run dev    # :3001
cd frontend && npm run dev         # :5173
```

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Clerk |
| API | Cloudflare Workers, Hono, Drizzle ORM, D1, R2, KV |
| Agent | @tencent-ai/agent-sdk, DeepSeek LLM, SiliconFlow TTS |
| 认证 | Clerk |
| 支付 | Stripe |

## License

MIT
