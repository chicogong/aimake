# CODEBUDDY.md

This file provides guidance to CodeBuddy Code when working with code in this repository.

## Project Overview

AIMake is an AI-powered audio content generation platform (AI 语音内容生成平台) for creating podcasts, audiobooks, voiceovers, and educational content via TTS. It is a monorepo with three main components: a Cloudflare Workers API backend, a React frontend, and a static landing page website.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query + shadcn/ui (Radix)
- **Backend**: Cloudflare Workers + Hono + Drizzle ORM + D1 (SQLite) + R2 (storage) + KV (cache)
- **Auth**: Clerk (JWT-based)
- **Payment**: Stripe
- **TTS Providers**: OpenAI (`tts-1`), SiliconFlow (`MOSS-TTSD-v0.5`)
- **Website**: Static HTML + vanilla JS deployed to Cloudflare Pages

## Development Commands

### Root (code quality tools)

```bash
npm run lint              # ESLint + Stylelint + Markdownlint
npm run lint:js           # ESLint only (website/**/*.js)
npm run lint:css          # Stylelint only (website/**/*.css)
npm run lint:md           # Markdownlint only
npm run format            # Prettier format all files
npm run format:check      # Prettier check without writing
```

### Frontend (`frontend/`)

```bash
cd frontend
npm run dev               # Vite dev server at http://localhost:5173
npm run build             # TypeScript check + Vite production build
npm run preview           # Preview production build
npm run lint              # ESLint + TypeScript check
npm run test              # Vitest (stores, utils tests)
npx vitest run            # Run tests once
npx vitest run src/__tests__/stores.test.ts  # Run a single test file
npx tsc --noEmit          # TypeScript type check only
```

### Backend (`api/`)

```bash
cd api
npm run dev               # Wrangler dev server at http://localhost:8787
npm run deploy            # Deploy to Cloudflare Workers
npm run test              # Vitest (schema, error, utils tests)
npx vitest run            # Run tests once
npx vitest run src/__tests__/schema.test.ts  # Run a single test file
npx tsc --noEmit          # TypeScript type check only
npm run db:generate       # Generate Drizzle migrations
npm run db:migrate        # Apply migrations locally
npx wrangler d1 migrations apply aimake-db         # Apply migrations to production
npx wrangler d1 migrations apply aimake-db --local  # Apply migrations locally (alternative)
```

## Project Structure

```
aimake/
├── api/                          # Backend - Cloudflare Workers (Hono)
│   ├── src/
│   │   ├── index.ts              # Hono app entry point, route mounting
│   │   ├── routes/               # API route handlers
│   │   │   ├── health.ts         # GET /api/health
│   │   │   ├── auth.ts           # GET /api/auth/me + Clerk webhook
│   │   │   ├── voices.ts         # GET /api/voices (static data, no auth)
│   │   │   ├── tts.ts            # POST /tts/generate, /tts/generate-sync
│   │   │   ├── audios.ts         # Audio CRUD + download
│   │   │   └── user.ts           # Quota + usage history
│   │   ├── services/
│   │   │   └── tts.ts            # TTS generation logic (OpenAI + SiliconFlow)
│   │   ├── middleware/
│   │   │   ├── auth.ts           # Clerk JWT verification + auto user creation
│   │   │   ├── error.ts          # AppError class + error factory helpers
│   │   │   └── rateLimit.ts      # KV-based rate limiting (60 req/min general, 10/min TTS)
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client initialization
│   │   │   └── schema.ts         # 8 tables: users, voices, audios, ttsJobs, podcasts, subscriptions, usageLogs
│   │   ├── types/
│   │   │   └── index.ts          # Env bindings, API response types
│   │   ├── utils/
│   │   │   ├── id.ts             # UUID generation
│   │   │   └── response.ts       # Standardized API response helpers
│   │   └── __tests__/            # Vitest tests
│   ├── migrations/               # D1 SQL migration files
│   ├── wrangler.toml             # Workers config (D1, KV, R2 bindings)
│   └── vitest.config.ts
│
├── frontend/                     # Frontend - React SPA
│   └── src/
│       ├── App.tsx               # React Router config (routes: /, /history, /pricing)
│       ├── main.tsx              # Entry point + ClerkProvider wrapping
│       ├── pages/
│       │   ├── HomePage.tsx      # Main TTS generation UI
│       │   ├── HistoryPage.tsx   # Audio history list
│       │   └── PricingPage.tsx   # Subscription plans
│       ├── components/
│       │   ├── ApiAuthProvider.tsx # Auth setup wrapper
│       │   ├── tts/              # TTSForm, VoiceSelector, AudioPlayer
│       │   ├── layout/           # Layout, Header
│       │   └── ui/               # shadcn/ui primitives (button, card, slider, toast, etc.)
│       ├── stores/
│       │   ├── userStore.ts      # Zustand: user profile + quota
│       │   └── ttsStore.ts       # Zustand: TTS input state + generation status
│       ├── services/
│       │   └── api.ts            # Axios client with Clerk JWT interceptor
│       ├── hooks/
│       │   └── useToast.ts
│       ├── types/
│       │   └── index.ts          # Frontend type definitions
│       ├── lib/
│       │   └── utils.ts          # cn() and other utilities
│       └── __tests__/            # Vitest tests
│
├── website/                      # Static landing pages (Cloudflare Pages)
│   ├── index.html                # Main landing page
│   ├── product.html              # Product features page
│   ├── developers.html           # Developer docs navigation
│   ├── docs.html                 # GitBook-style Markdown doc viewer
│   └── assets/                   # CSS, JS, images, demo audio
│
├── docs/                         # 34 design documents (planning, design, development, research)
├── wrangler.toml                 # Root: Cloudflare Pages config for website
├── eslint.config.js              # ESLint 9.x flat config
├── .prettierrc.json
├── .stylelintrc.json
└── .markdownlint.json
```

## Architecture

### Backend Request Flow

```
Request → errorHandler middleware → auth middleware → rateLimit → Route Handler → Service → Cloudflare Bindings (D1/R2/KV)
```

- **Env bindings** are typed in `api/src/types/index.ts` as the `Env` interface with `DB`, `KV`, `R2` (R2Bucket), and secret keys.
- **Routes** are mounted in `api/src/index.ts` as Hono route groups.
- **Public routes** (health, voices, Clerk webhook) skip auth middleware.
- **Protected routes** require Bearer token in Authorization header.

### Frontend Data Flow

```
Pages → Components → Hooks/Stores → API Service (Axios) → Backend
```

- **Zustand stores** hold client-side state (user profile/quota in `userStore`, TTS form state in `ttsStore`).
- **API client** (`frontend/src/services/api.ts`) uses Axios with a request interceptor that auto-injects the Clerk JWT token.
- **Vite proxy** forwards `/api` requests to `localhost:8787` during development.

### TTS Generation Flow

1. User enters text and selects voice in `TTSForm`
2. Frontend calls `POST /api/tts/generate-sync` with text, voiceId, speed, format
3. Backend auth middleware verifies JWT, checks quota
4. `TTSService` routes to OpenAI or SiliconFlow based on voice provider
5. Audio blob returned directly (sync) or stored in R2 (async via job tracking)
6. Frontend plays audio via `AudioPlayer` component

### Database Schema

8 tables defined in `api/src/db/schema.ts` using Drizzle ORM:
- **users** - Clerk users with plan/quota tracking (indexed on clerkId, email)
- **voices** - TTS voice catalog (14+ voices across providers)
- **audios** - Generated audio records with soft delete
- **ttsJobs** - Async job status tracking (pending → processing → completed/failed)
- **podcasts** - Multi-speaker podcast generation tracking
- **subscriptions** - Stripe subscription state
- **usageLogs** - Per-request usage/cost tracking

### Error Handling

- Backend uses `AppError` class from `api/src/middleware/error.ts` with standardized codes: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `QUOTA_EXCEEDED`, `RATE_LIMITED`, `TTS_ERROR`, `PAYMENT_ERROR`, `INTERNAL_ERROR`.
- Error factories: `badRequest()`, `unauthorized()`, `notFound()`, `quotaExceeded()`, `rateLimited()`, etc.
- Response format: `{ code: "ERR_TTS_XXX", message: "...", details: {...} }`
- Full error details exposed in development only.

## Code Conventions

- TypeScript strict mode in both frontend and backend
- Prefer `interface` over `type` for object shapes
- Functional React components + Hooks only (no class components)
- Avoid `any`; use `unknown` or specific types
- Tailwind CSS utility classes for styling; no inline styles (except dynamic values)
- No `console.log` in production code; use `console.warn` or `console.error`
- All API endpoints must be defined in `docs/design/api-design.md` first
- Error codes must follow the pattern in `docs/design/error-handling.md`
- Environment variables: frontend uses `VITE_*` prefix; backend secrets via `wrangler secret put`
- Sensitive values (`.dev.vars`, `.env.local`) must never be committed

## Key Design Documents

Read these before making significant changes:

| Document | Content |
|---|---|
| `docs/README.md` | Full documentation index |
| `docs/design/api-design.md` | REST API route definitions and TypeScript types |
| `docs/design/database-schema.md` | D1 table structures and ER diagram |
| `docs/design/backend-architecture.md` | Hono middleware chain and service layer patterns |
| `docs/design/frontend-architecture.md` | Component hierarchy, Hooks, Zustand store design |
| `docs/design/error-handling.md` | Error code definitions and handling conventions |
| `docs/development/env-config.md` | Complete environment variable reference |
| `docs/planning/ai-providers-overview.md` | TTS/LLM/ASR provider selection and cost analysis |

## Adding New Features

### New API Endpoint
1. Define route/types in `docs/design/api-design.md`
2. Add route handler in `api/src/routes/`
3. Add service logic in `api/src/services/` if needed
4. Register route in `api/src/index.ts`
5. Choose error codes from `docs/design/error-handling.md`

### New Frontend Page
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add reusable components to `frontend/src/components/`
4. For i18n, add keys to `frontend/src/i18n/locales/zh-CN.json` and `en.json`, use `useTranslation()` hook

### Database Changes
1. Update schema in `api/src/db/schema.ts`
2. Generate migration: `cd api && npx drizzle-kit generate`
3. Apply locally: `npx wrangler d1 migrations apply aimake-db --local`
4. Update `docs/design/database-schema.md`
