# 安全政策

## 支持的版本

| 版本 | 支持状态 |
| ---- | -------- |
| 最新 | ✅       |

## 报告漏洞

如果你发现安全漏洞，请**不要**创建公开的 Issue。

### 报告方式

请通过以下方式私下报告安全问题：

1. **Email**: 发送邮件至 [chicogong@tencent.com](mailto:chicogong@tencent.com)
2. **GitHub Security Advisory**: 使用 [GitHub 私有漏洞报告](https://github.com/chicogong/aimake/security/advisories/new)

### 报告内容

请在报告中包含：

- 漏洞描述
- 复现步骤
- 影响范围
- 可能的修复建议（如有）

### 响应时间

- **确认收到**: 48 小时内
- **初步评估**: 7 天内
- **修复发布**: 视严重程度而定

### 披露政策

- 我们会在修复发布后公开致谢（如报告者同意）
- 请在我们发布修复之前不要公开披露漏洞详情

## 安全最佳实践

### 对于用户

- 不要在公开场合分享你的 API Keys
- 定期轮换 API Keys
- 使用环境变量管理敏感信息

### 对于贡献者

- 不要在代码中硬编码敏感信息
- 使用 `.env.example` 而非 `.env` 提交示例
- 提交前检查是否有敏感信息泄露

## 已知安全功能

- 所有 API 请求使用 HTTPS
- API Keys 不会出现在日志中
- 使用 Clerk 进行身份认证
- 使用 Stripe 处理支付（PCI DSS 合规）

---

感谢你帮助保持 AIMake 的安全！
