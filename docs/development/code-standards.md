# 代码标准化规范

> 基于业界最佳实践 - 2026-01-10

---

## 📋 标准化工具清单

### 1. 代码格式化

| 工具             | 用途                   | 配置文件           |
| ---------------- | ---------------------- | ------------------ |
| **Prettier**     | HTML/CSS/JS/MD 格式化  | `.prettierrc.json` |
| **Ruff**         | Python 代码格式化+检查 | `.ruffignore`      |
| **EditorConfig** | 统一编辑器配置         | `.editorconfig`    |

### 2. 代码检查（Linting）

| 工具             | 用途                                        | 配置文件             |
| ---------------- | ------------------------------------------- | -------------------- |
| **ESLint**       | JavaScript 代码检查                         | `.eslintrc.json`     |
| **Stylelint**    | CSS 代码检查                                | `.stylelintrc.json`  |
| **Ruff**         | Python 代码检查+格式化（替代 Black+Flake8） | `.ruffignore`        |
| **Markdownlint** | Markdown 文档检查                           | `.markdownlint.json` |

### 3. Git 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范手动编写提交消息。

**格式**: `<type>(<scope>): <subject>`

**类型**: feat, fix, docs, style, refactor, perf, test, build, ci, chore

### 4. CI/CD

| 工具               | 用途         | 配置文件                 |
| ------------------ | ------------ | ------------------------ |
| **GitHub Actions** | 自动化 CI/CD | `.github/workflows/`     |
| **Dependabot**     | 依赖自动更新 | `.github/dependabot.yml` |

---

## 🎯 推荐配置

### EditorConfig (`.editorconfig`)

```ini
# EditorConfig: https://editorconfig.org

root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.py]
indent_size = 4

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

---

### Prettier (`.prettierrc.json`)

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always"
      }
    }
  ]
}
```

**忽略文件** (`.prettierignore`):

```
node_modules/
.venv/
.wrangler/
dist/
build/
*.min.js
*.min.css
landing/assets/audio/
```

---

### ESLint (`.eslintrc.json`)

```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

---

### Stylelint (`.stylelintrc.json`)

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "indentation": 2,
    "string-quotes": "single",
    "no-duplicate-selectors": true,
    "color-hex-case": "lower",
    "color-hex-length": "short",
    "color-named": "never",
    "selector-max-id": 0,
    "selector-combinator-space-after": "always",
    "selector-attribute-operator-space-before": "never",
    "selector-attribute-operator-space-after": "never",
    "selector-attribute-brackets-space-inside": "never",
    "declaration-block-trailing-semicolon": "always",
    "declaration-colon-space-before": "never",
    "declaration-colon-space-after": "always",
    "number-leading-zero": "always",
    "function-url-quotes": "always",
    "font-family-name-quotes": "always-where-recommended",
    "comment-whitespace-inside": "always",
    "rule-empty-line-before": "always-multi-line",
    "selector-pseudo-element-colon-notation": "double",
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["tailwind", "apply", "variants", "responsive", "screen"]
      }
    ]
  }
}
```

---

### Python - Ruff (`.ruffignore`)

Ruff 是现代化的 Python Linter + Formatter，比 Black + Flake8 更快更强大。

**配置文件**:

```ini
# Ruff ignore file - exclude directories from linting

# Claude Code 配置和技能目录
.claude/
.codebuddy/

# 虚拟环境
.venv/
venv/
env/

# 依赖目录
node_modules/

# 构建输出
dist/
build/
.wrangler/

# Git
.git/
```

**使用方式**:

```bash
# 检查代码
ruff check .

# 自动修复
ruff check . --fix

# 格式化代码
ruff format .
```

---

### Markdownlint (`.markdownlint.json`)

```json
{
  "default": true,
  "MD013": false,
  "MD033": false,
  "MD041": false,
  "MD024": {
    "siblings_only": true
  }
}
```

---

### 代码检查 (`.github/workflows/lint.yml`)

```yaml
name: Code Quality

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master, develop]

jobs:
  lint-js:
    name: Lint JavaScript
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint:js

      - name: Run Stylelint
        run: npm run lint:css

  lint-python:
    name: Lint Python
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install ruff

      - name: Run Ruff
        run: ruff check . --exclude .claude --exclude .codebuddy

  format-check:
    name: Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Prettier
        run: npm install -g prettier

      - name: Check formatting
        run: prettier --check "**/*.{js,css,html,md}"
```

---

### 自动部署 (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - master
    paths:
      - 'landing/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy Landing Page
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: aimake-landing
          directory: landing
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

### Dependabot (`.github/dependabot.yml`)

```yaml
version: 2
updates:
  # NPM dependencies
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
    labels:
      - 'dependencies'
      - 'npm'
    reviewers:
      - 'chicogong'

  # Python dependencies
  - package-ecosystem: 'pip'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 5
    labels:
      - 'dependencies'
      - 'python'
    reviewers:
      - 'chicogong'

  # GitHub Actions
  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'weekly'
    open-pull-requests-limit: 3
    labels:
      - 'dependencies'
      - 'github-actions'
    reviewers:
      - 'chicogong'
```

---

## 📁 项目目录结构规范

### 推荐结构

```
aimake/
├── .github/                    # GitHub 配置
│   ├── workflows/              # CI/CD workflows
│   │   ├── lint.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   ├── ISSUE_TEMPLATE/         # Issue 模板
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
│
├── docs/                       # 文档目录
│   ├── README.md               # 文档索引
│   ├── planning/               # 产品规划文档
│   ├── design/                 # 技术设计文档
│   └── development/            # 开发运维文档
│
├── landing/                    # 落地页 (静态站点)
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   ├── images/
│   │   └── audio/
│   ├── index.html
│   ├── _headers
│   ├── _redirects
│   └── robots.txt
│
├── frontend/                   # React 前端 (未来)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── api/                        # Cloudflare Workers 后端 (未来)
│   ├── src/
│   ├── wrangler.toml
│   └── package.json
│
├── scripts/                    # 工具脚本
│   ├── generate-demo-audio.py
│   └── optimize-images.sh
│
├── tests/                      # 测试文件 (未来)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .editorconfig               # 编辑器配置
├── .prettierrc.json            # Prettier 配置
├── .eslintrc.json              # ESLint 配置
├── .stylelintrc.json           # Stylelint 配置
├── .markdownlint.json          # Markdownlint 配置
├── .ruffignore                 # Ruff 忽略配置
├── .gitignore                  # Git 忽略文件
├── .env.example                # 环境变量示例
├── pyproject.toml              # Python 项目配置
├── package.json                # NPM 包配置
├── CHANGELOG.md                # 变更日志
├── CLAUDE.md                   # Claude 项目说明
├── README.md                   # 项目说明
└── LICENSE                     # 开源许可证
```

---

## 📝 Package.json 脚本

```json
{
  "name": "aimake",
  "version": "0.1.0",
  "scripts": {
    "lint": "npm run lint:js && npm run lint:css && npm run lint:md",
    "lint:js": "eslint 'landing/**/*.js' --fix",
    "lint:css": "stylelint 'landing/**/*.css' --fix",
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "format": "prettier --write '**/*.{js,css,html,json,md}'",
    "format:check": "prettier --check '**/*.{js,css,html,json,md}'",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "devDependencies": {
    "eslint": "^8.57.1",
    "markdownlint-cli": "^0.39.0",
    "prettier": "^3.7.4",
    "stylelint": "^16.26.1",
    "stylelint-config-standard": "^36.0.1"
  }
}
```

---

## 🎯 实施步骤

### 第 1 步：安装依赖

```bash
# NPM 依赖
npm install

# Python 依赖
pip install ruff
```

### 第 2 步：首次格式化

```bash
# 格式化所有代码
npm run format

# 检查 Python 代码
ruff check --fix .
ruff format .
```

### 第 3 步：配置 GitHub Secrets

在 GitHub 仓库设置中添加：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## ✅ PR 检查清单

提交 Pull Request 前确保：

- [ ] 代码已通过 `npm run lint`
- [ ] 代码已格式化 `npm run format`
- [ ] Python 代码已检查 `ruff check .`
- [ ] Python 代码已格式化 `ruff format .`
- [ ] 提交消息符合 Conventional Commits 规范
- [ ] 已更新 CHANGELOG.md
- [ ] 已添加必要的文档
- [ ] 所有 CI 检查通过
- [ ] 代码已在本地测试

---

## 📚 参考资源

- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Ruff](https://docs.astral.sh/ruff/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions](https://docs.github.com/actions)
- [EditorConfig](https://editorconfig.org/)

---

**最后更新**: 2026-01-10 **适用项目**: AIMake Web Landing Page
