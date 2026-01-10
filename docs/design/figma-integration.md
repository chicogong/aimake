# Figma 集成与 AI 代码生成设计

## 概述

本文档描述如何将 Figma 设计工具与 AI 代码生成工具链集成，实现设计到代码的高效转换。

## 工具链选项对比

| 方案                 | 优势                                  | 劣势                     | 适用场景           |
| -------------------- | ------------------------------------- | ------------------------ | ------------------ |
| **Figma MCP Server** | 直接读取 Figma 设计稿，保持设计一致性 | 需要配置，学习成本       | 有设计师参与的项目 |
| **v0.dev**           | 快速生成，交互式迭代                  | 可能与现有样式不完全一致 | 快速原型，新页面   |
| **AI 直接生成**      | 无需额外工具，灵活                    | 需要详细描述，一致性挑战 | 简单组件，快速修复 |

## 推荐工作流

```
┌─────────────────────────────────────────────────────────────────────┐
│                        设计到代码工作流                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │  Figma  │───▶│ Figma MCP   │───▶│ Claude/AI   │───▶│ 代码输出  ││
│  │  设计稿  │    │   Server    │    │   生成代码   │    │ React组件 ││
│  └─────────┘    └─────────────┘    └─────────────┘    └──────────┘ │
│       │                                                      │      │
│       │         ┌─────────────┐                              │      │
│       └────────▶│   v0.dev    │──────────────────────────────┘      │
│                 │  快速生成    │                                     │
│                 └─────────────┘                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Figma MCP Server 配置

### 1.1 安装配置

使用 `figma-context-mcp` 或官方 Figma MCP 服务器：

```json
// .mcp.json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "${FIGMA_API_KEY}"
      }
    }
  }
}
```

### 1.2 获取 Figma API Token

1. 打开 Figma → Settings → Account
2. 滚动到 "Personal access tokens"
3. 点击 "Create new token"
4. 复制 token 并设置环境变量：

```bash
export FIGMA_API_KEY="figd_xxxxxxxxxxxxx"
```

### 1.3 使用方法

在 Claude/AI 对话中：

```
请根据这个 Figma 设计稿生成 React 组件：
https://www.figma.com/design/xxxxx/AIMake?node-id=123-456

要求：
- 使用 Tailwind CSS
- 遵循项目现有的组件模式
- 支持响应式布局
```

---

## 2. v0.dev 集成

### 2.1 使用场景

- 快速生成新页面原型
- 探索不同的 UI 设计方案
- 生成复杂的交互组件

### 2.2 工作流

1. **描述需求**：在 v0.dev 中描述想要的组件
2. **迭代优化**：通过对话调整样式和功能
3. **导出代码**：复制生成的 React/Tailwind 代码
4. **本地适配**：调整以匹配项目规范

### 2.3 提示词模板

```
创建一个音频播放卡片组件：
- 显示标题、时长、创建时间
- 播放/暂停按钮带动画
- 进度条可拖动
- 使用以下配色：
  - 主色：#1A6BA0
  - 背景：#F8FAFC
  - 文字：#1E293B
- 支持深色模式
- 响应式设计（移动端优先）
```

---

## 3. Figma 设计规范

### 3.1 命名规范

为了让 AI 更好地理解设计稿，Figma 中的图层命名应遵循：

```
页面命名：
├── 📄 Landing Page
├── 📄 Create - Default
├── 📄 Create - Recording
├── 📄 Library - Empty
├── 📄 Library - With Items
├── 📄 Settings - Profile
└── 📄 Settings - Subscription

组件命名：
├── 🧩 Button / Primary / Default
├── 🧩 Button / Primary / Hover
├── 🧩 Button / Secondary / Default
├── 🧩 Input / Text / Default
├── 🧩 Input / Text / Focus
├── 🧩 Input / Text / Error
├── 🧩 Card / Audio / Default
├── 🧩 Card / Audio / Playing
└── 🧩 Modal / Confirm / Default
```

### 3.2 样式变量映射

Figma Variables → Tailwind CSS 映射：

| Figma Variable        | Tailwind Class            | CSS Value                   |
| --------------------- | ------------------------- | --------------------------- |
| `color/primary/500`   | `text-primary`            | `#1A6BA0`                   |
| `color/primary/600`   | `hover:text-primary-dark` | `#15567F`                   |
| `color/secondary/500` | `text-secondary`          | `#10B981`                   |
| `color/gray/50`       | `bg-gray-50`              | `#F8FAFC`                   |
| `color/gray/900`      | `text-gray-900`           | `#1E293B`                   |
| `spacing/4`           | `p-4`                     | `16px`                      |
| `spacing/6`           | `p-6`                     | `24px`                      |
| `radius/lg`           | `rounded-lg`              | `8px`                       |
| `shadow/md`           | `shadow-md`               | `0 4px 6px rgba(0,0,0,0.1)` |

### 3.3 组件库结构

```
Figma 组件库
├── 🎨 Foundations
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Effects (shadows, blur)
│
├── 🧱 Primitives
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Checkbox
│   ├── Radio
│   ├── Toggle
│   └── Badge
│
├── 🏗️ Components
│   ├── Card
│   ├── Modal
│   ├── Dropdown
│   ├── Toast
│   ├── Tooltip
│   └── Progress
│
└── 📐 Patterns
    ├── Navigation
    ├── Forms
    ├── Tables
    └── Empty States
```

---

## 4. AI 直接生成指南

### 4.1 有效的提示词结构

```markdown
## 组件需求

**名称**：AudioCard **用途**：显示单个音频文件的信息和操作

**Props**：

- id: string
- title: string
- duration: number (秒)
- createdAt: Date
- status: 'ready' | 'processing' | 'error'
- onPlay: () => void
- onDelete: () => void

**视觉要求**：

- 卡片样式，圆角 8px
- 悬停时显示阴影
- 状态指示器（颜色点）

**交互**：

- 点击卡片播放
- 右键菜单或更多按钮显示操作

**参考**：

- 遵循 docs/design/ui-ux-design.md 的设计系统
- 使用 src/components/ui/Button 等现有组件
```

### 4.2 代码生成检查清单

生成代码后，确保：

- [ ] 使用 TypeScript 类型
- [ ] 遵循项目命名规范（PascalCase 组件，camelCase 函数）
- [ ] 使用 Tailwind CSS，避免内联样式
- [ ] 支持响应式（sm, md, lg 断点）
- [ ] 包含必要的 aria 属性
- [ ] 处理加载和错误状态
- [ ] 导出类型定义

---

## 5. 截图转代码工作流

### 5.1 使用场景

当没有 Figma 设计稿时，可以通过截图生成代码：

1. 截取参考设计图
2. 提供给 Claude 并描述需求
3. 迭代调整生成的代码

### 5.2 提示词示例

```
请根据这个截图生成 React 组件：

[粘贴截图]

要求：
1. 使用 TypeScript + Tailwind CSS
2. 保持与截图相同的布局和间距
3. 适配我们的配色方案（主色 #1A6BA0）
4. 添加响应式支持
5. 组件应该是可复用的
```

---

## 6. 设计同步策略

### 6.1 版本控制

```
设计版本同步
├── Figma 版本历史
│   └── 通过 Figma Version History 管理
│
├── 代码版本
│   └── Git + 语义化版本
│
└── 同步点
    ├── 每个 Sprint 开始时同步设计
    ├── 设计变更通过 PR 描述记录
    └── 组件库变更需更新文档
```

### 6.2 设计 Token 同步

```typescript
// scripts/sync-figma-tokens.ts
// 从 Figma Variables 同步设计 Token 到 Tailwind 配置

import { FigmaAPI } from '@figma/rest-api-spec';

async function syncTokens() {
  const figma = new FigmaAPI(process.env.FIGMA_API_KEY);

  // 获取设计变量
  const variables = await figma.getFileVariables('FILE_ID');

  // 转换为 Tailwind 配置
  const tailwindConfig = transformToTailwind(variables);

  // 写入配置文件
  await writeConfig('tailwind.config.js', tailwindConfig);
}
```

---

## 7. 组件生成模板

### 7.1 基础组件模板

```tsx
// src/components/ui/[ComponentName].tsx

import { cn } from '@/lib/utils';

interface ComponentNameProps {
  /** 组件的主要内容 */
  children: React.ReactNode;
  /** 额外的 CSS 类 */
  className?: string;
  /** 变体样式 */
  variant?: 'default' | 'secondary' | 'outline';
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
}

export function ComponentName({
  children,
  className,
  variant = 'default',
  size = 'md',
}: ComponentNameProps) {
  return (
    <div
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center rounded-lg font-medium',
        // 变体样式
        {
          'bg-primary text-white': variant === 'default',
          'bg-secondary text-white': variant === 'secondary',
          'border border-gray-300 bg-white': variant === 'outline',
        },
        // 尺寸样式
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
    >
      {children}
    </div>
  );
}
```

### 7.2 复合组件模板

```tsx
// src/components/features/AudioCard/index.tsx

import { AudioCardRoot } from './AudioCardRoot';
import { AudioCardThumbnail } from './AudioCardThumbnail';
import { AudioCardContent } from './AudioCardContent';
import { AudioCardActions } from './AudioCardActions';

export const AudioCard = {
  Root: AudioCardRoot,
  Thumbnail: AudioCardThumbnail,
  Content: AudioCardContent,
  Actions: AudioCardActions,
};

// 使用方式：
// <AudioCard.Root>
//   <AudioCard.Thumbnail src={...} />
//   <AudioCard.Content title={...} duration={...} />
//   <AudioCard.Actions onPlay={...} onDelete={...} />
// </AudioCard.Root>
```

---

## 8. 质量保证

### 8.1 生成代码审查要点

| 检查项              | 说明                      | 优先级 |
| ------------------- | ------------------------- | ------ |
| TypeScript 类型完整 | Props 和返回值都有类型    | 高     |
| 响应式设计          | 至少支持 mobile/desktop   | 高     |
| 可访问性            | ARIA 标签，键盘导航       | 高     |
| 性能优化            | 避免不必要的重渲染        | 中     |
| 代码风格            | 符合 ESLint/Prettier 规则 | 中     |
| 测试覆盖            | 包含基本的单元测试        | 中     |
| 文档注释            | JSDoc 注释说明用途        | 低     |

### 8.2 常见问题修复

```tsx
// ❌ 问题：硬编码颜色
<div className="bg-[#1A6BA0]">

// ✅ 修复：使用 Tailwind 变量
<div className="bg-primary">


// ❌ 问题：缺少响应式
<div className="flex gap-8">

// ✅ 修复：添加响应式断点
<div className="flex flex-col gap-4 md:flex-row md:gap-8">


// ❌ 问题：缺少加载状态
{data && <List items={data} />}

// ✅ 修复：完整的状态处理
{isLoading && <Skeleton />}
{error && <ErrorMessage error={error} />}
{data && <List items={data} />}
{!data && !isLoading && !error && <EmptyState />}
```

---

## 9. 推荐开发流程

### 9.1 MVP 阶段（当前）

```
1. 参考 ui-ux-design.md 和 pages-design.md 中的设计
2. 使用 AI 直接生成代码
3. 使用 v0.dev 生成复杂组件
4. 手动调整以匹配项目规范
```

### 9.2 正式阶段（未来）

```
1. 设计师在 Figma 中完成设计
2. 设置 Figma MCP Server
3. 使用 AI 读取 Figma 生成代码
4. 同步设计 Token 到代码
5. 自动化设计审查
```

---

## 10. 相关资源

### 10.1 文档链接

- [UI/UX 设计规范](./ui-ux-design.md)
- [页面设计文档](./pages-design.md)
- [Landing Page 设计](./landing-page-design.md)
- [前端架构设计](./frontend-architecture.md)

### 10.2 外部资源

- [Figma MCP Server (GitHub)](https://github.com/anthropics/anthropic-quickstarts)
- [v0.dev](https://v0.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com)

### 10.3 工具配置示例

```json
// 完整的 MCP 配置示例
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--stdio"],
      "env": {
        "FIGMA_API_KEY": "${FIGMA_API_KEY}"
      }
    },
    "browser": {
      "command": "npx",
      "args": ["-y", "@anthropic/browser-mcp"]
    }
  }
}
```

---

## 更新日志

| 日期       | 版本  | 更新内容                                    |
| ---------- | ----- | ------------------------------------------- |
| 2024-01-09 | 1.0.0 | 初始版本，包含 Figma MCP 和 v0.dev 集成指南 |
