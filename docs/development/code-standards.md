# 代码标准化规范

> 基于业界最佳实践 - 2026-01-10

---

## 📋 标准化工具清单

### 1. 代码格式化

| 工具             | 用途                  | 配置文件           |
| ---------------- | --------------------- | ------------------ |
| **Prettier**     | HTML/CSS/JS/MD 格式化 | `.prettierrc.json` |
| **Black**        | Python 代码格式化     | `pyproject.toml`   |
| **EditorConfig** | 统一编辑器配置        | `.editorconfig`    |

### 2. 代码检查（Linting）

| 工具             | 用途                           | 配置文件             |
| ---------------- | ------------------------------ | -------------------- |
| **ESLint**       | JavaScript 代码检查            | `.eslintrc.json`     |
| **Stylelint**    | CSS 代码检查                   | `.stylelintrc.json`  |
| **Ruff**         | Python 代码检查（替代 Flake8） | `pyproject.toml`     |
| **Markdownlint** | Markdown 文档检查              | `.markdownlint.json` |

### 3. Git 规范

| 工具            | 用途             | 配置文件             |
| --------------- | ---------------- | -------------------- |
| **Commitlint**  | 提交消息规范检查 | `.commitlintrc.json` |
| **Husky**       | Git hooks 管理   | `.husky/`            |
| **Lint-staged** | 仅检查暂存文件   | `.lintstagedrc.json` |

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

### Python - Ruff (`pyproject.toml`)

```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501",  # line too long (handled by formatter)
]

[tool.black]
line-length = 100
target-version = ['py311']
include = '\.pyi?$'
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

### Commitlint (`.commitlintrc.json`)

```json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]
    ],
    "scope-case": [2, "always", "kebab-case"],
    "subject-case": [2, "never", ["upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100]
  }
}
```

**提交消息格式**：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例**：

```
feat(landing): 添加演示音频播放器

- 支持播放/暂停
- 显示进度条
- 支持音量调节

Closes #123
```

---

### Lint-staged (`.lintstagedrc.json`)

```json
{
  "*.{js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss}": ["stylelint --fix", "prettier --write"],
  "*.{html,json,md}": ["prettier --write"],
  "*.py": ["ruff check --fix", "black"]
}
```

---

## 🚀 GitHub Actions CI/CD

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
          cache: 'pip'

      - name: Install dependencies
        run: pip install ruff black

      - name: Run Ruff
        run: ruff check .

      - name: Run Black
        run: black --check .

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

  commitlint:
    name: Commit Lint
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install commitlint
        run: npm install -g @commitlint/cli @commitlint/config-conventional

      - name: Validate commits
        run:
          npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{
          github.event.pull_request.head.sha }} --verbose
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
├── .commitlintrc.json          # Commitlint 配置
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
    "prepare": "husky install",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3",
    "eslint": "^8.55.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "markdownlint-cli": "^0.38.0",
    "prettier": "^3.1.1",
    "stylelint": "^16.1.0",
    "stylelint-config-standard": "^36.0.0"
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
pip install ruff black
```

### 第 2 步：初始化 Husky

```bash
npm run prepare
```

### 第 3 步：配置 Pre-commit Hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'
```

### 第 4 步：首次格式化

```bash
# 格式化所有代码
npm run format

# 检查 Python 代码
ruff check --fix .
black .
```

### 第 5 步：配置 GitHub Secrets

在 GitHub 仓库设置中添加：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

---

## ✅ PR 检查清单

提交 Pull Request 前确保：

- [ ] 代码已通过 `npm run lint`
- [ ] 代码已格式化 `npm run format`
- [ ] Python 代码已检查 `ruff check .`
- [ ] Python 代码已格式化 `black .`
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
