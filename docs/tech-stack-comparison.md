# Technology Stack Comparison & Decision Matrix

## 1. Inference Engine: SGLang vs vLLM vs TensorRT-LLM

### Performance Benchmark (H100, Llama-3-8B)

| Metric | SGLang | vLLM | TensorRT-LLM |
|--------|--------|------|--------------|
| **Throughput** | 16,215 tok/s | 12,553 tok/s | 18,500 tok/s |
| **Latency (P95)** | 54.2s (500 prompts) | 58.9s | 48.0s |
| **Memory Efficiency** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Multi-modal Support** | ✅ Native | ⚠️ Limited | ❌ Text only |
| **Structured Output** | ✅ Native | ⚠️ Via Outlines | ⚠️ Via Plugins |
| **Cache Efficiency** | ✅ RadixAttention | ✅ PagedAttention | ✅ KV Cache |
| **Learning Curve** | Medium | Easy | Hard |

### Decision: **SGLang**

**Reasons:**
1. **29% faster than vLLM** for our use case (multi-turn dialogue)
2. **Native multi-modal support** - 为未来扩展视频/图像做准备
3. **RadixAttention** - 非常适合 TTS 场景（用户经常修改同一段文本）
4. **Python-native** - 团队熟悉度高

**Trade-offs:**
- TensorRT-LLM 更快，但：
  - 只支持文本
  - NVIDIA 专属（Lock-in）
  - 配置复杂

---

## 2. TTS Engine: CosyVoice vs ChatTTS vs Bark vs XTTS

### Feature Comparison

| Feature | CosyVoice | ChatTTS | Bark | XTTS v2 |
|---------|-----------|---------|------|---------|
| **中文支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **英文支持** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **语速控制** | ✅ SSML | ✅ Native | ❌ | ✅ Native |
| **情感控制** | ✅ | ✅ Advanced | ✅ | ⚠️ Limited |
| **语音克隆** | ✅ (3s sample) | ❌ | ❌ | ✅ (6s sample) |
| **推理速度** | 0.5s RTF | 0.3s RTF | 1.2s RTF | 0.8s RTF |
| **模型大小** | 2.5GB | 1.8GB | 3.2GB | 4.1GB |
| **开源协议** | Apache 2.0 | MIT | MIT | AGPL 3.0 |

**RTF = Real-Time Factor (< 1 表示比实时快)**

### Decision: **CosyVoice (主) + ChatTTS (备选)**

**Reasons:**
1. **中英双语均衡** - aimake.cc 目标用户可能需要双语配音
2. **SSML 支持** - 方便集成发音词典
3. **Apache 2.0** - 商业友好
4. **语音克隆** - Phase 2 可以快速上线

**Deployment Strategy:**
```python
# 主引擎
from cosyvoice import CosyVoice

# 降级策略（如果 CosyVoice 过载）
from chattts import ChatTTS as FallbackTTS
```

---

## 3. Frontend Framework: React vs Vue vs Svelte

### Canvas Rendering Performance

| Framework | Initial Load | Re-render (1000 Cards) | Ecosystem |
|-----------|--------------|------------------------|-----------|
| **React + Konva** | 1.2s | 45ms | ⭐⭐⭐⭐⭐ |
| **Vue + Konva** | 0.9s | 38ms | ⭐⭐⭐⭐ |
| **Svelte + Canvas** | 0.6s | 32ms | ⭐⭐⭐ |

### Decision: **React 18 + Konva.js**

**Reasons:**
1. **最成熟的 Canvas 库** - react-konva 星数 5.5k
2. **团队熟悉度** - 降低招聘成本
3. **React 18 Concurrent Mode** - 可优化大量卡片渲染
4. **TypeScript 支持** - 最好

**Alternative considered:**
- **Svelte** 性能更好，但生态不足（Canvas 库少）

---

## 4. Database: PostgreSQL vs MongoDB vs MySQL

### Use Case Analysis

| Requirement | PostgreSQL | MongoDB | MySQL |
|-------------|-----------|---------|-------|
| **JSONB 存储**（画布数据） | ✅ Native | ✅ Native | ⚠️ JSON (not indexed) |
| **全文搜索**（词典） | ✅ ts_vector | ✅ Text Index | ⚠️ FULLTEXT (limited) |
| **事务支持** | ✅ ACID | ⚠️ Limited | ✅ ACID |
| **扩展性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **运维成本** | Medium | Low | Low |

### Decision: **PostgreSQL 16**

**Reasons:**
1. **JSONB + 索引** - 完美存储画布状态
   ```sql
   SELECT * FROM canvas WHERE data @> '{"cards": [{"type": "audio"}]}';
   ```
2. **强事务** - 保证支付/配额数据一致性
3. **成熟的 ORM** - SQLAlchemy/Prisma 支持好

**Scaling Strategy:**
- Phase 1: 单机 PostgreSQL
- Phase 2: Read Replicas
- Phase 3: Citus (分布式)

---

## 5. State Management: Zustand vs Redux vs Jotai

### Comparison

| Library | Bundle Size | Learning Curve | DevTools |
|---------|-------------|----------------|----------|
| **Zustand** | 3.2kb | ⭐⭐⭐⭐⭐ Easy | ✅ |
| **Redux Toolkit** | 12kb | ⭐⭐⭐ Medium | ✅ |
| **Jotai** | 4.5kb | ⭐⭐⭐⭐ Easy | ✅ |
| **Recoil** | 21kb | ⭐⭐ Hard | ✅ |

### Decision: **Zustand**

**Reasons:**
1. **最小 Bundle** - 对 Canvas 性能友好
2. **不需要 Provider** - 简化代码
3. **支持 Immer** - 方便实现 Undo/Redo

**Example:**
```tsx
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useCanvasStore = create(immer((set) => ({
  cards: [],
  addCard: (card) => set((state) => {
    state.cards.push(card);
  }),
  undo: () => set((state) => {
    // Immer 自动处理不可变更新
  })
})));
```

---

## 6. Object Storage: MinIO vs AWS S3 vs Cloudflare R2

### Cost Comparison (10TB/月, 1M requests)

| Provider | Storage Cost | Bandwidth Cost | Request Cost | Total |
|----------|--------------|----------------|--------------|-------|
| **AWS S3** | $230 | $900 (10TB egress) | $5 | **$1,135** |
| **Cloudflare R2** | $150 | $0 (免费) | $4.5 | **$154.5** |
| **MinIO (Self-hosted)** | $50 (服务器) | $100 (带宽) | $0 | **$150** |

### Decision: **MinIO (开发) + Cloudflare R2 (生产)**

**Reasons:**
1. **开发环境** - MinIO 免费，易于调试
2. **生产环境** - R2 无 egress 费用（省 90%）
3. **备份** - S3 Glacier（每月 $40）

---

## 7. Monitoring: Prometheus + Grafana vs Datadog vs New Relic

### Feature vs Cost

| Feature | Prometheus (Self-hosted) | Datadog | New Relic |
|---------|--------------------------|---------|-----------|
| **Metrics** | ✅ Free | $15/host | $25/host |
| **Logs** | ⚠️ Loki (额外配置) | ✅ Included | ✅ Included |
| **APM** | ❌ | ✅ | ✅ |
| **Alerting** | ✅ Free | ✅ | ✅ |
| **月成本 (5 hosts)** | $0 | $75 | $125 |

### Decision: **Prometheus + Grafana + Sentry**

**Reasons:**
1. **成本** - 完全免费（自托管）
2. **灵活性** - 自定义 Dashboard
3. **社区** - k8s 生态标配

**补充工具:**
- **Sentry** - 前端错误追踪（免费 5k events/月）
- **Uptime Robot** - 外部可用性监控（免费）

---

## Summary: Final Tech Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+
- **Inference**: SGLang 0.3+
- **TTS**: CosyVoice (main) + ChatTTS (fallback)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Queue**: Bull MQ
- **Storage**: MinIO (dev) + Cloudflare R2 (prod)

### Frontend
- **Framework**: React 18 + TypeScript
- **Canvas**: Konva.js + react-konva
- **State**: Zustand + Immer
- **UI**: Shadcn/ui + TailwindCSS
- **Build**: Vite 5

### Infrastructure
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (k3s for dev)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Sentry
- **CDN**: Cloudflare

### Cost Estimate
- **Development**: $150/月 (MinIO + 开发服务器)
- **Production (MVP)**: $2,500/月
- **Production (Scale)**: $5,000-10,000/月 (1000+ users)
