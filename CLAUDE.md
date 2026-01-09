# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# aimake.cc - AI 多模态创作平台

> TTS 生成平台，核心特性：发音精确的语音合成 + 无限画布交互设计

## 🚨 核心约定

### 设计系统（非常重要）
- **主色调**: Sonic Blue (#1A6BA0) - **绝对禁止使用 AI 紫色**
- **强调色**: Audio Orange (#E85D00)
- **用户反馈**: "不要用AI紫色 太 AI了" - 这是核心设计原则，必须严格遵守

### 代码风格
- **简洁至上**: 不要过度设计，不要创建冗余文档
- **文档最小化**: 只保留 README.md, MVP_ROADMAP.md 和 docs/ 目录
- **避免添加**: SETUP.md, DEVELOPMENT.md 等冗余文档

## 🛠️ 开发命令

```bash
# 开发服务器 (http://localhost:3000)
npm run dev

# TypeScript 类型检查
npm run type-check

# 生产构建
npm run build

# 预览生产版本
npm run preview

# ESLint 检查
npm run lint
```

## 🏗️ 核心架构

### 技术栈
- **前端**: React 18 + TypeScript (严格模式)
- **构建**: Vite 5 (ESM 模式，必须在 package.json 设置 `"type": "module"`)
- **样式**: Tailwind CSS 3.4 (自定义 Sonic Blue 主题)
- **Canvas**: Konva.js + react-konva (无限画布实现)
- **状态**: Zustand + Immer (不可变状态更新)
- **类型**: TypeScript 5.3 (严格类型检查，包括 `noUncheckedIndexedAccess`)

### 目录结构重点

```
aimake/
├── frontend-components/     # React 组件库（可复用）
│   ├── ui/                 # Button, Input 等基础组件
│   ├── canvas/             # AudioCard, PromptCard 核心卡片
│   └── layout/             # Toolbar 等布局组件
│
├── frontend-types/          # ⚠️ 注意：是 frontend-types，不是 types
│   ├── card.ts             # 卡片类型（PromptCard, AudioCard, CompareCard）
│   └── canvas.ts           # Canvas 状态和交互类型
│
├── src/
│   ├── api/                # API 客户端封装
│   ├── stores/             # Zustand stores（canvasStore, audioStore）
│   ├── hooks/              # React 自定义 hooks
│   ├── utils/              # 工具函数（logger, ErrorBoundary）
│   └── components/         # 应用级组件（layout）
```

### 路径别名配置（vite.config.ts + tsconfig.json）

```typescript
// ✅ 正确用法
import { Button } from '@components/ui/Button';
import type { AudioCard } from '@types/card';
import { useCanvasStore } from '@stores/canvasStore';
import { apiClient } from '@api/client';

// ❌ 错误：不要用相对路径或错误的目录名
import type { AudioCard } from '../../types/card';  // 应该是 frontend-types
```

**重要**: 所有类型定义在 `frontend-types/`，通过 `@types/*` ��用。

## 🎨 设计系统

### Tailwind 颜色配置

```javascript
// tailwind.config.js
primary: {
  DEFAULT: '#1A6BA0',  // Sonic Blue
  light: '#2D88C4',
  dark: '#145783',
}
accent: {
  DEFAULT: '#E85D00',  // Audio Orange
  light: '#FF7C2E',
  dark: '#C44F00',
}
```

### 组件变体规范

- **Button**: `primary`, `accent`, `secondary`, `ghost`, `danger`
- **Sizes**: `sm`, `md`, `lg`
- **States**: `loading`, `disabled`

**重要**: 不要在 `clsx()` 中重复同样的 CSS 类，会触发 ESLint 警告。

## 🎯 产品核心概念

### "Infinity Canvas" 设计理念
- **不是聊天框**: 采用 Figma/Miro 风格的"创作画布"
- **卡片化流程**:
  - **PromptCard**: 用户输入文本 + TTS 参数
  - **AudioCard**: 生成的音频 + 波形可视化
  - **CompareCard**: A/B 测试对比两个音频
- **流式生成**: WebSocket 实时显示生成进度
- **版本管理**: 支持撤销/重做，历史版本对比

### 三大差异化优势
1. **自主推理引擎** - 基于 SGLang（比 vLLM 快 29%）
2. **发音词典服务** - 企业级精准发音控制
3. **无限画布交互** - 专为非技术用户设计的创作界面

## ⚠️ 常见问题与陷阱

### 1. 模块导入错误
```typescript
// ❌ 错误：目录名错误
import type { AudioCard } from '../../types/card';

// ✅ 正确：使用 frontend-types
import type { AudioCard } from '@types/card';
```

### 2. TypeScript 类型名称
```typescript
// ❌ 错误：大写 A
React.TextAreaHTMLAttributes

// ✅ 正确：小写 a
React.TextareaHTMLAttributes
```

### 3. Vite + ESM 配置要求
- `package.json` **必须** 包含 `"type": "module"`
- `postcss.config.js` 使用 ES 模块语法（`export default`）
- `vite.config.ts` 使用 `import path from 'path'`

### 4. Zustand + Immer 状态更新模式

```typescript
// ✅ 正确：使用 Immer 的可变风格
set((state) => {
  state.cards.push(newCard);  // Immer 会处理不可变性
});

// ❌ 错误：手动创建新数组（不需要）
set((state) => {
  state.cards = [...state.cards, newCard];  // Immer 中不推荐
});
```

### 5. Canvas Store 的 selectedIds 是 Set

```typescript
// ✅ 正确
state.selectedIds.add(cardId);
state.selectedIds.delete(cardId);
state.selectedIds.clear();

// ❌ 错误：当成数组
state.selectedIds.push(cardId);  // Set 没有 push 方法
```

## 🔧 技术实现细节

### API 客户端架构
- **位置**: `src/api/client.ts`
- **认证**: JWT Token (存储在 localStorage)
- **错误处理**: 统一的 ApiError 接口
- **日志**: 使用 `logger.debug/error` 记录请求

### 状态管理（Zustand）
- **canvasStore**: 画布状态（cards, viewport, history）
- **audioStore**: ��频播放状态
- **模式**: 使用 Immer middleware 简化不可变更新

### Canvas 实现策略
- **当前阶段**: 静态布局（临时，在 App.tsx）
- **Phase 2**: 将迁移到 Konva.js 实现拖拽
- **历史记录**: 使用 past/future 数组实现撤销/重做

## 📊 项目状态

### 当前阶段: Phase 2 (Infinity Canvas)
- [x] 环境搭建与 API 设计
- [x] 核心 TTS 实现
- [x] 发音词典 MVP
- [ ] Canvas 核心实现（**进行中**）
- [ ] 流式音频与实时同步
- [ ] UX 优化

详见 **[MVP_ROADMAP.md](./MVP_ROADMAP.md)**（12 周开发计划）

## 🚫 禁止行为

1. **禁止使用 AI 紫色** - 违反核心设计原则
2. **禁止创建过多文档** - 用户明确要求保持简洁
3. **禁止猜测 URL** - 只使用用户提供或本地文件的 URL
4. **禁止添加不必要的配置文件** - SETUP.md, CONTRIBUTING.md 等
5. **禁止在组件中硬编码颜色** - 必须使用 Tailwind 的 primary/accent 类

## 📚 关键文档

- **[MVP_ROADMAP.md](./MVP_ROADMAP.md)** - 12 周开发时间线和技术架构
- **[docs/design-system.md](./docs/design-system.md)** - 完整设计规范（颜色、组件、交互）
- **[docs/audiocard-spec.md](./docs/audiocard-spec.md)** - AudioCard 技术规范和实现细节
- **[docs/tech-stack-comparison.md](./docs/tech-stack-comparison.md)** - 技术选型决策（SGLang vs vLLM 等）
- **[docs/database-schema.sql](./docs/database-schema.sql)** - PostgreSQL 数据库设计

## 🔐 安全与隐私

- **仓库状态**: **私有**
- **不要分享**: 代码、配置、API keys 到公共渠道
- **认证**: JWT Token（24 小时过期）
- **限流**: 100 req/min per user

---

**最后更新**: 2026-01-09
**Claude Code 版本**: Sonnet 4.5
**项目维护**: aimake.cc team
