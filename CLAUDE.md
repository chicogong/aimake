# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

AIMake is an AI voice content generation platform. Users input text or URLs, and an Agent generates
podcasts, audiobooks, voiceovers, or educational audio content. The system uses a unified "jobs"
model where all content types flow through a single pipeline.

## Architecture

Three services communicate via HTTP:

```
Frontend (React)          API (CF Workers)              Agent Service (Node.js)
localhost:5173            localhost:8787                 localhost:3001
                   REST + Clerk JWT          HTTP POST /generate
  CreatePage ──────────────► /api/jobs ──────────────────► voice-agent
  JobDetailPage ◄── SSE ─── /api/jobs/:id/stream         (Agent SDK)
                             /api/internal ◄──── callbacks ──┘
```

- **Frontend → API**: REST with Clerk JWT in Authorization header. SSE for real-time progress.
- **API → Agent**: Fire-and-forget HTTP POST to `/generate` with `X-Internal-Secret` header.
- **Agent → API**: HTTP callbacks to `/api/internal/jobs/:id/*` to update progress, save scripts,
  upload audio.

## Development Commands

### API (`api/`)

```bash
npm run dev              # Wrangler dev server at localhost:8787
npm run test             # Vitest
npx vitest run src/__tests__/schema.test.ts  # Single test file
npm run typecheck        # tsc --noEmit
npm run db:migrate       # Apply D1 migrations locally
npm run db:migrate:prod  # Apply D1 migrations to production
```

### Frontend (`frontend/`)

```bash
npm run dev              # Vite dev server at localhost:5173
npm run build            # TypeScript check + Vite production build
npm run test             # Vitest
npx vitest run src/__tests__/utils.test.ts   # Single test file
npm run typecheck        # tsc --noEmit
```

### Agent Service (`agent-service/`)

```bash
npm run dev              # tsx watch with hot reload
npm run build            # TypeScript compilation
npm run test             # Vitest
```

### Root (code quality)

```bash
npm run lint             # ESLint + Stylelint + Markdownlint
npm run format           # Prettier
```

## API Route Structure (`api/src/index.ts`)

Public routes (no auth): `/api/health`, `/api/voices`, `/api/webhook`, `/api/internal`

Protected routes (Clerk JWT → authMiddleware → rateLimitMiddleware):

- `/api/jobs` — CRUD + SSE progress stream + download
- `/api/tts` — Quick TTS only (`POST /api/tts/quick`)
- `/api/auth` — `GET /api/auth/me`
- `/api/user` — Quota and usage

Middleware chain: `logger()` → `timing()` → `secureHeaders()` → `cors()` → `errorHandler` →
`authMiddleware` → `rateLimitMiddleware()`

### Dev Auth Bypass

In development, send `X-Dev-Bypass: true` header to skip Clerk JWT verification. Auto-creates a
`dev@aimake.cc` user.

## Database (Drizzle ORM + Cloudflare D1)

5 tables defined in `api/src/db/schema.ts`:

- **users** — Clerk users with plan/quota tracking
- **voices** — TTS voice catalog (static seed data in `api/src/routes/voices.ts`)
- **jobs** — Unified table replacing old audios/ttsJobs/podcasts. Tracks content_type, source,
  settings, script, audio output, 6-stage progress
- **subscriptions** — Stripe subscription state
- **usageLogs** — Per-request usage/cost tracking with job_id reference

Key job statuses: `pending` → `classifying` → `extracting` → `analyzing` → `scripting` →
`synthesizing` → `assembling` → `completed` | `failed`

Content types: `podcast`, `audiobook`, `voiceover`, `education`, `tts`

## Agent Service (`agent-service/`)

Uses `@tencent-ai/agent-sdk` with `query()` function. The agent runs a 6-stage pipeline orchestrated
by an LLM (deepseek-v3.1) with 6 MCP tools:

| Tool                   | Purpose                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `extract_content`      | Fetch text from URL                                          |
| `report_progress`      | Callback to API with stage/progress                          |
| `save_script`          | Callback to API with generated script JSON                   |
| `batch_generate_tts`   | Call TTS API for multiple segments in parallel (PREFER THIS) |
| `generate_tts_segment` | Call SiliconFlow TTS API for one segment (corrections only)  |
| `assemble_audio`       | Concatenate audio segments                                   |
| `upload_audio`         | Callback to API with final audio (base64)                    |

Tools are registered as an MCP server in `agent-service/src/tools/index.ts`. The agent communicates
back to the API via `CallbackClient` (`agent-service/src/utils/callback-client.ts`).

## Frontend Patterns

- **Routing**: React Router in `frontend/src/App.tsx` — `/` (CreatePage), `/jobs/:id`
  (JobDetailPage), `/history`, `/pricing`
- **Auth**: Clerk's `<SignedIn>` / `<SignedOut>` components gate UI. `ApiAuthProvider` wraps the
  app.
- **API Client**: Axios instance in `frontend/src/services/api.ts` with Clerk JWT auto-injection via
  request interceptor
- **State**: Zustand `userStore` for user profile/quota. React Query for server data.
- **SSE**: `useJobStream` hook (`frontend/src/hooks/useJobStream.ts`) connects to
  `/api/jobs/:id/stream?token=xxx`
- **UI Components**: shadcn/ui primitives in `frontend/src/components/ui/`

## Error Handling

Backend uses `AppError` class from `api/src/middleware/error.ts`. Factory functions:
`errors.validation()`, `errors.unauthorized()`, `errors.notFound()`, `errors.quotaExceeded()`,
`errors.rateLimited()`, `errors.ttsError()`, `errors.jobError()`, `errors.serviceUnavailable()`.

Response format: `{ success: false, error: { code: "ERROR_CODE", message: "..." } }`

Error codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`,
`QUOTA_EXCEEDED`, `RATE_LIMITED`, `TTS_ERROR`, `JOB_ERROR`, `SERVICE_UNAVAILABLE`, `INTERNAL_ERROR`

In route handlers, throw errors directly: `throw errors.validation('message')` — the global
`errorHandler` catches them.

## Environment Variables

**API** (`api/.dev.vars`): `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `SILICONFLOW_API_KEY`,
`INTERNAL_API_SECRET`, `AGENT_SERVICE_URL`, `ENVIRONMENT`, `CORS_ORIGIN`

**Agent Service** (`agent-service/.env`): `CODEBUDDY_API_KEY`, `LLM_MODEL`, `SILICONFLOW_API_KEY`,
`WORKERS_API_URL`, `INTERNAL_API_SECRET`, `PORT`

**Frontend** (`frontend/.env.local`): `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`

## Code Conventions

- No `console.log` in production code — use `console.warn` or `console.error`
- Prefer `interface` over `type` for object shapes
- Tailwind CSS utility classes only, no inline styles (except dynamic values)
- Functional React components + Hooks only
- All environment secrets go in `.dev.vars` / `.env` (never committed)
- Migrations are in `api/migrations/` as raw SQL files
