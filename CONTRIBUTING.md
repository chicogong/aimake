# 贡献指南

感谢你对 AIMake 的关注！我们欢迎所有形式的贡献。

## 行为准则

参与本项目即表示你同意遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。

## 如何贡献

### 报告 Bug

1. 确认 Bug 尚未被报告（搜索 [Issues](https://github.com/chicogong/aimake/issues)）
2. 使用 [Bug Report 模板](.github/ISSUE_TEMPLATE/bug_report.md) 创建 Issue
3. 提供详细的复现步骤

### 提出新功能

1. 搜索现有 Issues 确认是否已有相似提案
2. 使用 [Feature Request 模板](.github/ISSUE_TEMPLATE/feature_request.md) 创建 Issue
3. 清楚描述功能需求和使用场景

### 提交代码

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 开发环境

### 前置要求

- Node.js 18+
- npm 或 pnpm
- Git

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/chicogong/aimake.git
cd aimake

# 安装依赖
npm install

# 运行 lint
npm run lint

# 运行格式化
npm run format
```

### 项目结构

```
aimake/
├── docs/           # 设计文档
├── landing/        # 落地页
├── scripts/        # 工具脚本
├── .github/        # GitHub 配置
└── ...
```

## 代码规范

### 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat(tts): add support for OpenAI TTS API
fix(auth): resolve token refresh issue
docs: update API documentation
```

### 代码风格

- JavaScript/TypeScript: ESLint + Prettier
- CSS: Stylelint
- Markdown: Markdownlint

运行检查：
```bash
npm run lint
```

自动修复：
```bash
npm run lint:fix
npm run format
```

## Pull Request 流程

1. 确保所有测试通过
2. 确保代码通过 lint 检查
3. 更新相关文档
4. 填写 PR 模板
5. 等待 Code Review

### PR 标题规范

与提交信息相同，使用 Conventional Commits 格式。

### PR 检查清单

- [ ] 代码通过 lint 检查
- [ ] 添加/更新了测试（如适用）
- [ ] 更新了文档（如适用）
- [ ] 所有 CI 检查通过

## 文档贡献

文档位于 `docs/` 目录，使用 Markdown 格式。

### 文档规范

- 使用中文
- 保持简洁清晰
- 提供代码示例
- 遵循现有文档结构

## 问题反馈

如有任何问题，欢迎：

- 创建 [Issue](https://github.com/chicogong/aimake/issues)
- 参与 [Discussions](https://github.com/chicogong/aimake/discussions)

## 许可证

贡献的代码将采用 [MIT License](LICENSE) 发布。

---

再次感谢你的贡献！
