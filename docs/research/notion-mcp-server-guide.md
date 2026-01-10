# Notion MCP Server 使用指南

> 研究日期: 2026-01-10官方仓库: https://github.com/makenotion/notion-mcp-server 版本: v2.0.0

---

## 目录

1. [概述](#概述)
2. [安装配置](#安装配置)
3. [可用工具](#可用工具)
4. [使用示例](#使用示例)
5. [API 调用详解](#api-调用详解)
6. [常见问题](#常见问题)

---

## 概述

### 什么是 Notion MCP Server?

Notion MCP Server 是 Notion 官方提供的 Model Context Protocol
(MCP) 服务器实现，允许 AI 助手（如 Claude、ChatGPT、Cursor）通过标准化协议与 Notion 工作区交互。

**核心特性:**

- 21 个内置工具，覆盖页面、数据库、块、用户、评论等操作
- 支持 OAuth 认证（托管版）或 API Token（自托管版）
- 支持 STDIO 和 HTTP 两种传输协议
- 完全兼容 Notion API v1

**架构:**

```
AI 工具 (Claude/Cursor)
    ↓ MCP 客户端
    ↓ MCP 协议
Notion MCP Server
    ↓ Notion API
Notion 工作区
```

---

## 安装配置

### 方式 1: NPX 快速启动（推荐）

**适用于:** Claude Desktop、Cursor、Zed

#### 1. 创建 Notion Integration

1. 访问 https://www.notion.so/profile/integrations
2. 点击 "New Integration"
3. 配置:
   - Name: `Claude MCP` 或任意名称
   - Type: Internal
   - Capabilities: 根据需求选择（可限制为只读）
4. 复制 Integration Token（格式: `ntn_****`）

#### 2. 授权页面访问

**方法 A: 批量授权**

1. 进入 Integration 的 "Access" 标签
2. 点击 "Edit access"
3. 选择需要访问的页面/数据库

**方法 B: 单页授权**

1. 打开 Notion 页面
2. 点击右上角 "..." → "Connect to integration"
3. 选择你的 Integration

#### 3. 配置 MCP 客户端

**Claude Desktop / Cursor:**

文件位置:

- macOS: `~/.cursor/mcp.json` 或 `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_your_token_here"
      }
    }
  }
}
```

**Zed:**

文件: `settings.json`

```json
{
  "context_servers": {
    "notion": {
      "command": {
        "path": "npx",
        "args": ["-y", "@notionhq/notion-mcp-server"],
        "env": {
          "NOTION_TOKEN": "ntn_your_token_here"
        }
      }
    }
  }
}
```

#### 4. 重启并验证

1. 重启 AI 工具
2. 查看工具列表，确认 Notion 工具已加载
3. 测试: `搜索我的 Notion 页面`

---

### 方式 2: Docker 部署

```json
{
  "mcpServers": {
    "notionApi": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "NOTION_TOKEN", "mcp/notion"],
      "env": {
        "NOTION_TOKEN": "ntn_your_token_here"
      }
    }
  }
}
```

---

### 方式 3: HTTP 传输模式

**启动服务器:**

```bash
# 自动生成认证 token
npx @notionhq/notion-mcp-server --transport http

# 自定义 token 和端口
npx @notionhq/notion-mcp-server \
  --transport http \
  --auth-token "your-secret-token" \
  --port 8080
```

**调用示例:**

```bash
curl -H "Authorization: Bearer your-secret-token" \
     -H "Content-Type: application/json" \
     -H "mcp-session-id: session-123" \
     -d '{
       "jsonrpc": "2.0",
       "method": "tools/call",
       "params": {
         "name": "search",
         "arguments": {"query": "项目文档"}
       },
       "id": 1
     }' \
     http://localhost:3000/mcp
```

---

## 可用工具

### 数据源工具（Databases）

| 工具名称                     | 功能             | 主要参数                            |
| ---------------------------- | ---------------- | ----------------------------------- |
| `query-data-source`          | 查询数据库       | `data_source_id`, `filter`, `sorts` |
| `retrieve-a-data-source`     | 获取数据库元数据 | `data_source_id`                    |
| `update-a-data-source`       | 更新数据库属性   | `data_source_id`, `properties`      |
| `create-a-data-source`       | 创建新数据库     | `parent`, `properties`, `title`     |
| `list-data-source-templates` | 列出数据库模板   | `data_source_id`                    |

### 页面工具（Pages）

| 工具名称                        | 功能             | 主要参数                           |
| ------------------------------- | ---------------- | ---------------------------------- |
| `retrieve-a-page`               | 获取页面详情     | `page_id`                          |
| `create-a-page`                 | 创建新页面       | `parent`, `properties`, `children` |
| `update-a-page`                 | 更新页面属性     | `page_id`, `properties`            |
| `move-page`                     | 移动页面到新父级 | `page_id`, `parent`                |
| `retrieve-a-page-property-item` | 获取页面属性详情 | `page_id`, `property_id`           |

### 块工具（Blocks）

| 工具名称                  | 功能         | 主要参数                        |
| ------------------------- | ------------ | ------------------------------- |
| `retrieve-block-children` | 获取子块列表 | `block_id`, `page_size`         |
| `append-block-children`   | 追加子块     | `block_id`, `children`, `after` |
| `delete-a-block`          | 删除块       | `block_id`                      |

### 用户与评论工具

| 工具名称                         | 功能              | 主要参数                |
| -------------------------------- | ----------------- | ----------------------- |
| `list-all-users`                 | 列出所有用户      | `page_size`             |
| `retrieve-a-user`                | 获取用户详情      | `user_id`               |
| `retrieve-your-token-s-bot-user` | 获取 Bot 用户信息 | 无                      |
| `create-comment`                 | 创建评论          | `parent`, `rich_text`   |
| `retrieve-comments`              | 获取评论列表      | `block_id` 或 `page_id` |

### 搜索工具

| 工具名称 | 功能             | 主要参数                  |
| -------- | ---------------- | ------------------------- |
| `search` | 搜索页面和数据库 | `query`, `filter`, `sort` |

---

## 使用示例

### 示例 1: 搜索页面

**自然语言:**

```
搜索标题包含 "项目计划" 的页面
```

**工具调用:**

```json
{
  "tool": "search",
  "arguments": {
    "query": "项目计划",
    "filter": {
      "property": "object",
      "value": "page"
    }
  }
}
```

---

### 示例 2: 创建页面

**自然语言:**

```
在 "开发文档" 页面下创建一个名为 "API 设计" 的子页面
```

**执行流程:**

1. 使用 `search` 找到 "开发文档" 页面的 `page_id`
2. 使用 `create-a-page` 创建子页面

**工具调用:**

```json
{
  "tool": "create-a-page",
  "arguments": {
    "parent": {
      "page_id": "1a6b35e6-e67f-802f-a7e1-d27686f017f2"
    },
    "properties": {
      "title": {
        "title": [
          {
            "type": "text",
            "text": {
              "content": "API 设计"
            }
          }
        ]
      }
    }
  }
}
```

---

### 示例 3: 创建带内容的页面

**自然语言:**

```
创建一个技术文档页面，包含标题、段落和代码块
```

**工具调用:**

```json
{
  "tool": "create-a-page",
  "arguments": {
    "parent": {
      "page_id": "parent-page-id"
    },
    "properties": {
      "title": {
        "title": [
          {
            "type": "text",
            "text": { "content": "技术文档" }
          }
        ]
      }
    },
    "children": [
      {
        "object": "block",
        "type": "heading_1",
        "heading_1": {
          "rich_text": [
            {
              "type": "text",
              "text": { "content": "概述" }
            }
          ]
        }
      },
      {
        "object": "block",
        "type": "paragraph",
        "paragraph": {
          "rich_text": [
            {
              "type": "text",
              "text": { "content": "这是一段说明文字。" }
            }
          ]
        }
      },
      {
        "object": "block",
        "type": "code",
        "code": {
          "rich_text": [
            {
              "type": "text",
              "text": { "content": "console.log('Hello World');" }
            }
          ],
          "language": "javascript"
        }
      }
    ]
  }
}
```

---

### 示例 4: 追加内容到页面

**自然语言:**

```
在页面末尾添加一个待办事项列表
```

**工具调用:**

```json
{
  "tool": "append-block-children",
  "arguments": {
    "block_id": "page-id-or-block-id",
    "children": [
      {
        "object": "block",
        "type": "to_do",
        "to_do": {
          "rich_text": [
            {
              "type": "text",
              "text": { "content": "完成 API 设计" }
            }
          ],
          "checked": false
        }
      },
      {
        "object": "block",
        "type": "to_do",
        "to_do": {
          "rich_text": [
            {
              "type": "text",
              "text": { "content": "编写测试用例" }
            }
          ],
          "checked": false
        }
      }
    ]
  }
}
```

---

### 示例 5: 查询数据库

**自然语言:**

```
查询 "任务数据库" 中状态为 "进行中" 的任务
```

**工具调用:**

```json
{
  "tool": "query-data-source",
  "arguments": {
    "data_source_id": "database-id",
    "filter": {
      "property": "状态",
      "select": {
        "equals": "进行中"
      }
    },
    "sorts": [
      {
        "property": "创建时间",
        "direction": "descending"
      }
    ]
  }
}
```

---

### 示例 6: 添加评论

**自然语言:**

```
在 "项目计划" 页面添加评论 "需要补充预算部分"
```

**工具调用:**

```json
{
  "tool": "create-comment",
  "arguments": {
    "parent": {
      "page_id": "page-id"
    },
    "rich_text": [
      {
        "type": "text",
        "text": {
          "content": "需要补充预算部分"
        }
      }
    ]
  }
}
```

---

## API 调用详解

### 块类型（Block Types）

#### 常用文本块

**段落 (paragraph):**

```json
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "文本内容" }
      }
    ],
    "color": "default"
  }
}
```

**标题 (heading_1/2/3):**

```json
{
  "type": "heading_1",
  "heading_1": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "一级标题" }
      }
    ],
    "is_toggleable": false
  }
}
```

**列表项 (bulleted_list_item / numbered_list_item):**

```json
{
  "type": "bulleted_list_item",
  "bulleted_list_item": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "列表项" }
      }
    ]
  }
}
```

**待办事项 (to_do):**

```json
{
  "type": "to_do",
  "to_do": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "任务描述" }
      }
    ],
    "checked": false
  }
}
```

**引用 (quote):**

```json
{
  "type": "quote",
  "quote": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "引用内容" }
      }
    ]
  }
}
```

**标注框 (callout):**

```json
{
  "type": "callout",
  "callout": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "重要提示" }
      }
    ],
    "icon": {
      "emoji": "⚠️"
    },
    "color": "yellow_background"
  }
}
```

**代码块 (code):**

```json
{
  "type": "code",
  "code": {
    "rich_text": [
      {
        "type": "text",
        "text": { "content": "const x = 42;" }
      }
    ],
    "language": "javascript"
  }
}
```

#### 媒体块

**图片 (image):**

```json
{
  "type": "image",
  "image": {
    "type": "external",
    "external": {
      "url": "https://example.com/image.png"
    }
  }
}
```

**视频 (video):**

```json
{
  "type": "video",
  "video": {
    "type": "external",
    "external": {
      "url": "https://youtube.com/watch?v=xxx"
    }
  }
}
```

#### 特殊块

**分隔线 (divider):**

```json
{
  "type": "divider",
  "divider": {}
}
```

**表格 (table):**

```json
{
  "type": "table",
  "table": {
    "table_width": 3,
    "has_column_header": true,
    "has_row_header": false
  }
}
```

**表格行 (table_row):**

```json
{
  "type": "table_row",
  "table_row": {
    "cells": [
      [{ "type": "text", "text": { "content": "单元格1" } }],
      [{ "type": "text", "text": { "content": "单元格2" } }],
      [{ "type": "text", "text": { "content": "单元格3" } }]
    ]
  }
}
```

---

### 富文本格式（Rich Text）

**基础文本:**

```json
{
  "type": "text",
  "text": {
    "content": "普通文本"
  }
}
```

**带格式文本:**

```json
{
  "type": "text",
  "text": {
    "content": "加粗斜体文本"
  },
  "annotations": {
    "bold": true,
    "italic": true,
    "strikethrough": false,
    "underline": false,
    "code": false,
    "color": "red"
  }
}
```

**链接:**

```json
{
  "type": "text",
  "text": {
    "content": "点击这里",
    "link": {
      "url": "https://example.com"
    }
  }
}
```

**提及用户:**

```json
{
  "type": "mention",
  "mention": {
    "type": "user",
    "user": {
      "id": "user-id"
    }
  }
}
```

**提及页面:**

```json
{
  "type": "mention",
  "mention": {
    "type": "page",
    "page": {
      "id": "page-id"
    }
  }
}
```

---

### 颜色选项（Colors）

**文本颜色:**

- `default`, `gray`, `brown`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink`, `red`

**背景颜色:**

- `gray_background`, `brown_background`, `orange_background`, `yellow_background`,
  `green_background`, `blue_background`, `purple_background`, `pink_background`, `red_background`

---

### 数据库查询过滤器（Filters）

**文本属性:**

```json
{
  "property": "标题",
  "rich_text": {
    "contains": "关键词"
  }
}
```

**选择属性:**

```json
{
  "property": "状态",
  "select": {
    "equals": "进行中"
  }
}
```

**日期属性:**

```json
{
  "property": "截止日期",
  "date": {
    "on_or_after": "2026-01-01"
  }
}
```

**复合条件:**

```json
{
  "and": [
    {
      "property": "状态",
      "select": { "equals": "进行中" }
    },
    {
      "property": "优先级",
      "select": { "equals": "高" }
    }
  ]
}
```

---

## 常见问题

### 1. 工具未显示

**检查清单:**

- JSON 配置文件语法是否正确（使用 JSONLint 验证）
- 路径是否为绝对路径（不能使用 `~` 或相对路径）
- `NOTION_TOKEN` 是否有效（格式: `ntn_****`）
- 是否重启了 AI 工具

**M1/M2 Mac 特殊处理:**

```json
{
  "command": "/opt/homebrew/bin/node",
  "args": ["/absolute/path/to/index.js"]
}
```

---

### 2. 权限错误（403）

**原因:**

- Integration 未连接到目标页面/数据库
- Integration 缺少必要的 Capabilities

**解决:**

1. 打开目标页面 → "..." → "Connect to integration"
2. 或在 Integration 设置中批量授权
3. 检查 Capabilities 是否包含所需权限（读/写/评论）

---

### 3. 页面 ID 获取

**方法 1: 从 URL 提取**

```
https://www.notion.so/My-Page-1a6b35e6e67f802fa7e1d27686f017f2
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              这是 page_id
```

**方法 2: 使用 search 工具**

```json
{
  "tool": "search",
  "arguments": {
    "query": "页面标题"
  }
}
```

---

### 4. 块嵌套限制

**规则:**

- 最多 2 层嵌套（父块 → 子块 → 孙块）
- 创建页面时 `children` 最多 100 个块
- 使用 `append-block-children` 可以追加更多

**示例:**

```json
{
  "type": "paragraph",
  "paragraph": {
    "rich_text": [{ "type": "text", "text": { "content": "父块" } }],
    "children": [
      {
        "type": "bulleted_list_item",
        "bulleted_list_item": {
          "rich_text": [{ "type": "text", "text": { "content": "子块" } }]
        }
      }
    ]
  }
}
```

---

### 5. 环境变量名称

**正确:**

```json
"env": {
  "NOTION_TOKEN": "ntn_****"
}
```

**错误:**

```json
"env": {
  "NOTION_API_KEY": "ntn_****"  // ❌ 错误的变量名
}
```

---

### 6. v2.0.0 破坏性变更

**已移除的工具:**

- `post-database-query` → 使用 `query-data-source`
- `retrieve-a-database` → 使用 `retrieve-a-data-source`
- `update-a-database` → 使用 `update-a-data-source`
- `create-a-database` → 使用 `create-a-data-source`

**参数变更:**

- `database_id` → `data_source_id`

---

## 最佳实践

### 1. 批量操作

**不推荐:**

```
创建 10 个页面（逐个调用 create-a-page）
```

**推荐:**

```
使用 append-block-children 一次性添加多个块
```

---

### 2. 搜索优化

**模糊搜索:**

```json
{
  "tool": "search",
  "arguments": {
    "query": "项目",
    "sort": {
      "direction": "descending",
      "timestamp": "last_edited_time"
    }
  }
}
```

**精确匹配:** 先搜索，再用 `page_id` 直接操作。

---

### 3. 错误处理

**检查返回值:**

```json
{
  "object": "error",
  "status": 400,
  "code": "validation_error",
  "message": "body failed validation..."
}
```

**常见错误码:**

- `400`: 参数错误
- `401`: Token 无效
- `403`: 权限不足
- `404`: 页面不存在
- `429`: 请求过多（Rate Limit）

---

## 参考资源

- [官方 GitHub 仓库](https://github.com/makenotion/notion-mcp-server)
- [Notion API 文档](https://developers.notion.com/reference)
- [MCP 协议规范](https://modelcontextprotocol.io)
- [Notion 开发者社区](https://developers.notion.com/docs/mcp)
- [Block 类型参考](https://developers.notion.com/reference/block)
- [Rich Text 格式](https://developers.notion.com/reference/rich-text)
- [数据库查询](https://developers.notion.com/reference/post-database-query)

---

**最后更新:** 2026-01-10 **文档版本:** 1.0
