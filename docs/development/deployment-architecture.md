# AIMake 部署架构设计

> 创建日期: 2026-01-09
> 目标: 从开发到生产的完整部署方案

---

## 一、部署架构总览

### 1.1 生产环境架构图

```
                                    ┌─────────────────┐
                                    │   Cloudflare    │
                                    │   DNS + CDN     │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   Cloudflare    │
                                    │   WAF + DDoS    │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
           ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
           │    Vercel       │      │  Railway/Fly    │      │      S3         │
           │   Frontend      │      │    Backend      │      │   音频存储       │
           │   (React SPA)   │      │   (FastAPI)     │      │                 │
           └─────────────────┘      └────────┬────────┘      └─────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
           ┌────────▼────────┐      ┌────────▼────────┐      ┌────────▼────────┐
           │   Supabase      │      │    Upstash      │      │  External APIs  │
           │   PostgreSQL    │      │     Redis       │      │  OpenAI/11Labs  │
           └─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 1.2 服务选型

| 服务 | 推荐方案 | 备选方案 | 月成本估算 |
|------|----------|----------|------------|
| **前端托管** | Vercel | Cloudflare Pages | 免费-$20 |
| **后端托管** | Railway | Fly.io / Render | $5-50 |
| **数据库** | Supabase | PlanetScale / Neon | 免费-$25 |
| **Redis** | Upstash | Railway Redis | 免费-$10 |
| **对象存储** | Cloudflare R2 | AWS S3 / Backblaze | $5-20 |
| **CDN** | Cloudflare | Vercel Edge | 免费 |
| **域名** | Cloudflare | Namecheap | $10-15/年 |
| **监控** | Sentry + Axiom | Datadog | 免费-$30 |

---

## 二、开发环境

### 2.1 Docker Compose 配置

```yaml
# docker-compose.yml

version: '3.8'

services:
  # 前端开发服务器
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000/api
    depends_on:
      - backend

  # 后端 API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/aimake
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
      - S3_ENDPOINT=http://minio:9000
      - S3_ACCESS_KEY=minioadmin
      - S3_SECRET_KEY=minioadmin
      - S3_BUCKET=aimake-audio
    depends_on:
      - db
      - redis
      - minio

  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=aimake
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/migrations/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MinIO (S3 兼容存储)
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  # Celery Worker (异步任务)
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    command: celery -A app.worker worker --loglevel=info
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/aimake
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### 2.2 前端 Dockerfile

```dockerfile
# frontend/Dockerfile.dev

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

### 2.3 后端 Dockerfile

```dockerfile
# backend/Dockerfile.dev

FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

## 三、生产环境部署

### 3.1 前端部署 (Vercel)

```json
// frontend/vercel.json

{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**部署步骤:**

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
cd frontend
vercel --prod

# 4. 设置环境变量 (Vercel Dashboard)
# VITE_API_URL=https://api.aimake.cc
```

### 3.2 后端部署 (Railway)

```toml
# backend/railway.toml

[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.prod"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

```dockerfile
# backend/Dockerfile.prod

FROM python:3.11-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 生产环境使用 gunicorn
RUN pip install gunicorn

EXPOSE 8000

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

**Railway 环境变量:**

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
S3_ENDPOINT=https://...r2.cloudflarestorage.com
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=aimake-audio
JWT_SECRET=...
CORS_ORIGINS=https://aimake.cc,https://www.aimake.cc
```

### 3.3 数据库部署 (Supabase)

```sql
-- Supabase SQL Editor

-- 1. 创建表 (参考 database-schema.md)

-- 2. 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- 3. 创建策略 (API 通过 service_role 访问，不受限制)

-- 4. 创建索引
CREATE INDEX CONCURRENTLY idx_audios_user_created 
ON audios(user_id, created_at DESC);
```

### 3.4 对象存储 (Cloudflare R2)

```python
# backend/app/services/storage.py

import boto3
from botocore.config import Config

class StorageService:
    def __init__(self):
        self.s3 = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='auto'
        )
        self.bucket = settings.S3_BUCKET
    
    def upload_audio(self, file_data: bytes, key: str) -> str:
        """上传音频文件，返回 URL"""
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=file_data,
            ContentType='audio/mpeg'
        )
        
        # 返回公开 URL
        return f"{settings.CDN_URL}/{key}"
    
    def get_presigned_url(self, key: str, expires: int = 3600) -> str:
        """获取预签名 URL (用于私有文件)"""
        return self.s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key},
            ExpiresIn=expires
        )
    
    def delete_audio(self, key: str):
        """删除音频文件"""
        self.s3.delete_object(Bucket=self.bucket, Key=key)
```

---

## 四、CI/CD 流水线

### 4.1 GitHub Actions - 前端

```yaml
# .github/workflows/frontend.yml

name: Frontend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Run linter
        run: cd frontend && npm run lint
      
      - name: Run tests
        run: cd frontend && npm run test
      
      - name: Build
        run: cd frontend && npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: frontend
```

### 4.2 GitHub Actions - 后端

```yaml
# .github/workflows/backend.yml

name: Backend CI/CD

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
          cache-dependency-path: backend/requirements.txt
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-asyncio httpx
      
      - name: Run linter
        run: cd backend && ruff check .
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379
        run: cd backend && pytest

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Railway CLI
        run: npm i -g @railway/cli
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          cd backend
          railway up --service backend
```

---

## 五、监控与告警

### 5.1 应用监控 (Sentry)

```python
# backend/app/main.py

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[
        FastApiIntegration(),
        SqlalchemyIntegration(),
    ],
    traces_sample_rate=0.1,  # 10% 采样
    profiles_sample_rate=0.1,
    environment=settings.ENVIRONMENT,
)
```

```tsx
// frontend/src/main.tsx

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 5.2 日志收集 (Axiom)

```python
# backend/app/core/logging.py

import logging
import axiom

class AxiomHandler(logging.Handler):
    def __init__(self, dataset: str):
        super().__init__()
        self.client = axiom.Client()
        self.dataset = dataset
    
    def emit(self, record):
        log_entry = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "timestamp": record.created,
            "path": getattr(record, 'path', None),
            "method": getattr(record, 'method', None),
            "status_code": getattr(record, 'status_code', None),
            "duration_ms": getattr(record, 'duration_ms', None),
        }
        self.client.ingest_events(self.dataset, [log_entry])

# 配置
logger = logging.getLogger("aimake")
logger.addHandler(AxiomHandler("aimake-logs"))
```

### 5.3 健康检查

```python
# backend/app/api/health.py

from fastapi import APIRouter, Response
from app.core.database import database
from app.core.redis import redis

router = APIRouter()

@router.get("/health")
async def health_check():
    """基础健康检查"""
    return {"status": "ok"}

@router.get("/health/ready")
async def readiness_check(response: Response):
    """就绪检查 - 检查所有依赖"""
    checks = {
        "database": False,
        "redis": False,
    }
    
    # 检查数据库
    try:
        await database.execute("SELECT 1")
        checks["database"] = True
    except Exception:
        pass
    
    # 检查 Redis
    try:
        await redis.ping()
        checks["redis"] = True
    except Exception:
        pass
    
    all_healthy = all(checks.values())
    
    if not all_healthy:
        response.status_code = 503
    
    return {
        "status": "ok" if all_healthy else "degraded",
        "checks": checks
    }
```

### 5.4 告警配置

```yaml
# 告警规则示例 (用于 Grafana / Axiom)

alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    notify:
      - slack: #alerts
      - email: team@aimake.cc
  
  - name: High Latency
    condition: p99_latency > 3s
    duration: 5m
    severity: warning
    notify:
      - slack: #alerts
  
  - name: Database Connection Errors
    condition: db_connection_errors > 0
    duration: 1m
    severity: critical
    notify:
      - slack: #alerts
      - pagerduty: on-call
  
  - name: TTS API Errors
    condition: tts_api_error_rate > 10%
    duration: 3m
    severity: warning
    notify:
      - slack: #alerts
```

---

## 六、扩容策略

### 6.1 自动扩容配置 (Railway/Fly.io)

```toml
# fly.toml (Fly.io 示例)

app = "aimake-api"
primary_region = "hkg"

[build]
dockerfile = "Dockerfile.prod"

[http_service]
internal_port = 8000
force_https = true
auto_stop_machines = true
auto_start_machines = true
min_machines_running = 1

[http_service.concurrency]
type = "requests"
hard_limit = 250
soft_limit = 200

[[services.http_checks]]
interval = 10000
grace_period = "5s"
method = "get"
path = "/health"
protocol = "http"
timeout = 2000

[metrics]
port = 9091
path = "/metrics"
```

### 6.2 数据库读写分离

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层                                  │
├──────────────────────┬──────────────────────────────────────┤
│       写操作         │              读操作                   │
│    (INSERT/UPDATE)   │           (SELECT)                   │
└──────────┬───────────┴──────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
    ┌────────────┐              ┌─────────────────┐
    │   Master   │──复制──────→│    Replica 1    │
    │  (Primary) │              │   (Read-only)   │
    └────────────┘              ├─────────────────┤
                                │    Replica 2    │
                                │   (Read-only)   │
                                └─────────────────┘
```

```python
# backend/app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 主库 (写)
master_engine = create_engine(settings.DATABASE_URL)

# 从库 (读)
replica_engine = create_engine(settings.DATABASE_REPLICA_URL)

MasterSession = sessionmaker(bind=master_engine)
ReplicaSession = sessionmaker(bind=replica_engine)

def get_write_session():
    return MasterSession()

def get_read_session():
    return ReplicaSession()
```

---

## 七、安全配置

### 7.1 环境变量管理

```bash
# 使用 doppler 或 infisical 管理密钥

# Doppler
doppler setup
doppler run -- python app/main.py

# 或直接注入
doppler secrets download --no-file --format env > .env
```

### 7.2 HTTPS 配置 (Cloudflare)

```
1. 在 Cloudflare 启用 Full (Strict) SSL/TLS
2. 启用 HSTS
3. 启用自动 HTTPS 重写
4. 配置 WAF 规则
```

### 7.3 API 安全

```python
# backend/app/middleware/security.py

from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Rate Limiting
class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        # 使用 Redis 实现限流
        key = f"rate_limit:{client_ip}"
        count = await redis.incr(key)
        
        if count == 1:
            await redis.expire(key, 60)  # 每分钟窗口
        
        if count > 100:  # 每分钟 100 次
            return JSONResponse(
                status_code=429,
                content={"error": "Too many requests"}
            )
        
        return await call_next(request)

app.add_middleware(RateLimitMiddleware)
```

---

## 八、备份与恢复

### 8.1 数据库备份

```bash
#!/bin/bash
# scripts/backup.sh

# 每日备份
DATE=$(date +%Y%m%d)
BACKUP_FILE="aimake_backup_${DATE}.dump"

# 导出数据库
pg_dump $DATABASE_URL -Fc > /tmp/$BACKUP_FILE

# 上传到 R2
aws s3 cp /tmp/$BACKUP_FILE s3://aimake-backups/$BACKUP_FILE \
    --endpoint-url $S3_ENDPOINT

# 清理本地文件
rm /tmp/$BACKUP_FILE

# 清理 30 天前的备份
aws s3 ls s3://aimake-backups/ --endpoint-url $S3_ENDPOINT | \
    while read -r line; do
        createDate=$(echo $line | awk '{print $1" "$2}')
        createDate=$(date -d "$createDate" +%s)
        olderThan=$(date -d "30 days ago" +%s)
        if [[ $createDate -lt $olderThan ]]; then
            fileName=$(echo $line | awk '{print $4}')
            aws s3 rm s3://aimake-backups/$fileName --endpoint-url $S3_ENDPOINT
        fi
    done
```

### 8.2 恢复流程

```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

# 从 R2 下载
aws s3 cp s3://aimake-backups/$BACKUP_FILE /tmp/$BACKUP_FILE \
    --endpoint-url $S3_ENDPOINT

# 恢复数据库
pg_restore -d $DATABASE_URL /tmp/$BACKUP_FILE --clean --if-exists

echo "Restore completed!"
```

---

## 九、成本优化

### 9.1 按阶段的推荐配置

| 阶段 | 用户数 | 配置 | 月成本 |
|------|--------|------|--------|
| **开发** | 0 | 本地 Docker | $0 |
| **Beta** | 0-100 | 免费层 | $0-20 |
| **上线** | 100-1000 | 基础付费 | $50-100 |
| **增长** | 1000-5000 | 扩展配置 | $200-500 |
| **规模** | 5000+ | 专业配置 | $500+ |

### 9.2 免费层最大化

```
Vercel:     100GB 带宽免费
Supabase:   500MB 数据库 + 1GB 存储免费
Upstash:    10K 命令/天免费
R2:         10GB 存储 + 无出口费用
Railway:    $5 免费额度/月
```

### 9.3 成本监控

```python
# backend/app/services/cost_tracker.py

class CostTracker:
    """追踪 API 调用成本"""
    
    PRICES = {
        "openai_tts": 0.000015,      # $0.015/1K chars
        "elevenlabs_tts": 0.00030,   # $0.30/1K chars
        "gpt4_input": 0.00001,       # $0.01/1K tokens
        "gpt4_output": 0.00003,      # $0.03/1K tokens
    }
    
    async def log_usage(
        self,
        user_id: str,
        service: str,
        units: int
    ):
        cost = units * self.PRICES.get(service, 0)
        
        await usage_logs.insert({
            "user_id": user_id,
            "service": service,
            "units": units,
            "cost": cost,
            "created_at": datetime.utcnow()
        })
        
        return cost
    
    async def get_daily_cost(self) -> float:
        """获取今日总成本"""
        result = await usage_logs.aggregate([
            {"$match": {"created_at": {"$gte": today_start}}},
            {"$group": {"_id": None, "total": {"$sum": "$cost"}}}
        ])
        return result[0]["total"] if result else 0
```

---

## 十、检查清单

### 上线前检查

- [ ] 所有环境变量已配置
- [ ] 数据库迁移已完成
- [ ] SSL 证书已配置
- [ ] CORS 已正确设置
- [ ] Rate Limiting 已启用
- [ ] 错误监控已配置 (Sentry)
- [ ] 日志收集已配置
- [ ] 备份策略已设置
- [ ] 健康检查端点可用
- [ ] DNS 已正确指向

### 上线后验证

- [ ] 所有页面可正常访问
- [ ] 注册/登录流程正常
- [ ] TTS 生成功能正常
- [ ] 音频播放/下载正常
- [ ] 支付流程正常 (如有)
- [ ] 监控数据正常上报
- [ ] 告警能正常触发

---

*文档持续更新中...*
