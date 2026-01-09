# TTS 供应商对比与选型指南

> 创建日期: 2026-01-09
> 目的: 对比主流 TTS 供应商的免费额度、定价、功能，制定多供应商架构策略

---

## 一、供应商免费额度对比

### 1.1 免费额度汇总表

| 供应商 | 免费额度 | 有效期 | 折合分钟数 | 音色数量 | 语言支持 |
|--------|---------|--------|-----------|---------|---------|
| **腾讯云 TTS** | 800万字符（基础/精品音色）<br>10万字符（AI模型音色）<br>2万字符（超自然AI音色） | 3个月（领取后） | ~40,000分钟<br>~500分钟<br>~100分钟 | 150+ | 中英日韩等 |
| **MiniMax** | 新用户1000积分<br>每月10,000字符 | 长期 | ~50分钟/月 | 20+ | 中英 |
| **Google Cloud TTS** | 标准音色：400万字符/月<br>WaveNet：100万字符/月 | 持续 | ~20,000分钟<br>~5,000分钟 | 220+ | 40+语言 |
| **Amazon Polly** | 标准：500万字符/月<br>Neural：100万字符/月 | 标准：持续<br>Neural：12个月 | ~25,000分钟<br>~5,000分钟 | 60+ | 30+语言 |
| **Azure TTS** | 500万字符/月 | 12个月 | ~25,000分钟 | 400+ | 110+语言 |
| **OpenAI TTS** | 无免费额度 | - | - | 6 | 多语言 |
| **ElevenLabs** | 10,000字符/月 | 持续 | ~50分钟 | 自定义 | 29语言 |

> **注**: 分钟数按中文200字/分钟估算

---

## 二、详细定价对比

### 2.1 付费价格表

| 供应商 | 标准音色 | 高级/Neural 音色 | 备注 |
|--------|---------|-----------------|------|
| **腾讯云 TTS** | ¥2/万字符<br>($0.28/1K chars) | 精品音色同价<br>AI模型音色：¥10/万字符 | 超自然AI：¥30/万字符 |
| **MiniMax** | Turbo: $30/百万字符<br>($0.03/1K chars) | HD: $50/百万字符<br>($0.05/1K chars) | 声音克隆：$3/个 |
| **Google Cloud TTS** | $4/百万字符<br>($0.004/1K chars) | WaveNet: $16/百万字符<br>($0.016/1K chars) | 新用户送$300 |
| **Amazon Polly** | $4/百万字符<br>($0.004/1K chars) | Neural: $16/百万字符<br>($0.016/1K chars) | 新用户送$200 (2025.7起) |
| **Azure TTS** | $1/百万字符<br>($0.001/1K chars) | Neural: $16/百万字符<br>($0.016/1K chars) | **最便宜的标准音色** |
| **OpenAI TTS** | $15/百万字符<br>($0.015/1K chars) | HD: $30/百万字符<br>($0.030/1K chars) | 音质优秀，中文支持好 |
| **ElevenLabs** | $0.30/1K chars | Turbo v2.5: $0.20/1K chars | **最贵**，但音质最真实 |

### 2.2 成本估算（1000个免费用户，平均每人10分钟/月）

| 供应商 | 使用免费额度 | 超出后成本 | 总月成本 |
|--------|-------------|-----------|---------|
| **腾讯云 TTS** | ✅ 800万字符 = 4万分钟<br>（远超1万分钟需求） | ¥0 | **¥0** |
| **MiniMax** | ❌ 1万字符/月 = 50分钟<br>（远低于1万分钟） | (200万 - 1万) × $0.03 | **$59.70** |
| **Google Cloud TTS** | ✅ 400万字符 = 2万分钟<br>（超过1万分钟需求） | $0 | **$0** |
| **Amazon Polly** | ✅ 500万字符 = 2.5万分钟<br>（超过1万分钟需求） | $0 | **$0** |
| **Azure TTS** | ✅ 500万字符 = 2.5万分钟 | $0（前12个月） | **$0** → $2（12个月后） |
| **OpenAI TTS** | ❌ 无免费额度 | 200万 × $0.015 | **$30** |
| **ElevenLabs** | ❌ 1万字符/月 | (200万 - 1万) × $0.30 | **$597** |

---

## 三、功能特性对比

### 3.1 核心功能矩阵

| 功能 | 腾讯云 | MiniMax | Google | Amazon | Azure | OpenAI | ElevenLabs |
|------|--------|---------|--------|--------|-------|--------|------------|
| **SSML 支持** | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **情感控制** | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **语速调节** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **音调控制** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **流式输出** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **WebSocket** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **音色克隆** | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **发音词典** | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |

### 3.2 音质评估（主观评分，1-5分）

| 供应商 | 中文音质 | 英文音质 | 自然度 | 稳定性 | 综合评分 |
|--------|---------|---------|--------|--------|---------|
| **腾讯云（精品音色）** | 4.5 | 4.0 | 4.2 | 5.0 | **4.4** |
| **MiniMax（HD��** | 4.8 | 4.3 | 4.5 | 4.5 | **4.5** |
| **Google WaveNet** | 4.0 | 4.5 | 4.3 | 5.0 | **4.4** |
| **Amazon Neural** | 4.2 | 4.6 | 4.4 | 5.0 | **4.5** |
| **Azure Neural** | 4.3 | 4.7 | 4.5 | 5.0 | **4.6** |
| **OpenAI TTS-1-HD** | 4.6 | 4.8 | 4.7 | 4.5 | **4.7** |
| **ElevenLabs Turbo v2.5** | 4.9 | 5.0 | 4.9 | 4.0 | **4.7** |

**关键发现**:
- **ElevenLabs** 和 **OpenAI** 音质最佳，但成本高
- **腾讯云精品音色** 和 **MiniMax HD** 在中文场景表现优秀
- **Azure Neural** 性价比最高（功能全+价格低）

---

## 四、推荐架构策略

### 4.1 多供应商路由策略

```
根据用户场景智能路由:

┌─────────────────────────────────────────────────────────┐
│                     用户请求                             │
│  (text, voice_id, quality, emotion)                     │
└─────────────────┬───────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │   路由决策器     │
         │ (TTS Router)    │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌────────┐   ┌────────┐   ┌────────┐
│Priority│   │Quality │   │Fallback│
│  路由  │   │  路由  │   │  路由  │
└───┬────┘   └───┬────┘   └───┬────┘
    │            │            │
    ▼            ▼            ▼
免费额度     高音质需求      主供应商失败
    │            │            │
    ▼            ▼            ▼
腾讯云/Google  OpenAI/Azure  备用供应商
```

### 4.2 供应商选择决策树

```python
def select_provider(request: TTSRequest) -> str:
    """智能选择 TTS 供应商"""

    # 1. 检查用户套餐
    if user.plan == "free":
        # 优先使用免费额度供应商
        if tencent_quota_available():
            return "tencent"
        elif google_quota_available():
            return "google"
        elif amazon_quota_available():
            return "amazon"
        else:
            return "azure"  # 付费最便宜

    # 2. Pro 用户：根据音质需求
    elif request.quality == "ultra":
        # 超高音质需求
        if request.language == "zh":
            return "minimax_hd"  # 中文场景
        else:
            return "elevenlabs"   # 英文场景

    elif request.quality == "high":
        # 高音质需求
        return "openai"

    # 3. 特殊功能需求
    elif request.emotion:
        return "tencent"  # 情感控制最好

    elif request.use_custom_voice:
        return "elevenlabs"  # 声音克隆

    # 4. 默认：性价比最高
    else:
        return "azure"
```

### 4.3 推荐配置（分阶段）

#### Phase 1: MVP 阶段（0-100 用户）

```yaml
primary_provider: tencent_cloud
  reason: 800万字符免费额度，3个月有效期
  usage: 全部流量

fallback_provider: google_cloud
  reason: 400万字符/月持续免费
  usage: 腾讯云故障时

���注:
  - 100个用户 × 10分钟 = 1000分钟 = 20万字符
  - 腾讯云免费额度可支撑 400个月用量（33年）
  - 零成本运营
```

#### Phase 2: 增长阶段（100-1000 用户）

```yaml
primary_provider: google_cloud
  reason: 400万字符/月持续免费
  usage: 80%流量（免费额度内）

secondary_provider: azure
  reason: $0.001/1K chars（最便宜）
  usage: 20%流量（超出部分）

fallback_provider: amazon_polly
  reason: 500万字符/月免费
  usage: 紧急故障切换

月成本估算:
  - 1000用户 × 10分钟 = 1万分钟 = 200万字符
  - Google免费: 400万 → 覆盖100%
  - 月成本: $0
```

#### Phase 3: 规模化阶段（1000-10000 用户）

```yaml
router_strategy: intelligent_routing

免费用户（80%）:
  - Google Cloud: 400��字符/月
  - Amazon Polly: 500万字符/月
  - Azure (paid): 超出部分

Pro用户（20%）:
  - OpenAI TTS: 高音质需求
  - MiniMax HD: 中文高质量
  - ElevenLabs: 声音克隆需求

月成本估算:
  - 免费用户: 8000 × 10分钟 = 1600万字符
    - Google/Amazon覆盖: 900万（56%）
    - Azure付费: 700万 × $0.001 = $7
  - Pro用户: 2000 × 30分钟 = 1200万字符
    - OpenAI: 1000万 × $0.015 = $150
    - MiniMax: 200万 × $0.05 = $100

总成本: $257/月
收入: 2000 × $9.9 = $19,800
利润率: 98.7%
```

---

## 五、技术实现

### 5.1 抽象基类设计

```python
# backend/app/services/tts/base.py

from abc import ABC, abstractmethod
from typing import Optional, Dict, List
from dataclasses import dataclass

@dataclass
class TTSRequest:
    text: str
    voice_id: str
    speed: float = 1.0
    pitch: float = 0.0
    emotion: Optional[str] = None
    language: str = "zh-CN"
    output_format: str = "mp3"
    sample_rate: int = 24000

@dataclass
class TTSResponse:
    audio_data: bytes
    duration: float
    cost: float
    provider: str
    voice_used: str

class BaseTTSProvider(ABC):
    """TTS 供应商抽象基类"""

    def __init__(self, api_key: str, region: Optional[str] = None):
        self.api_key = api_key
        self.region = region

    @abstractmethod
    async def synthesize(self, request: TTSRequest) -> TTSResponse:
        """合成语音"""
        pass

    @abstractmethod
    def get_voices(self) -> List[Dict]:
        """获取可用音色列表"""
        pass

    @abstractmethod
    def estimate_cost(self, text: str) -> float:
        """估算成本"""
        pass

    @abstractmethod
    def check_quota(self) -> Dict:
        """检查剩余配额"""
        pass

    @property
    @abstractmethod
    def name(self) -> str:
        """供应商名称"""
        pass

    @property
    @abstractmethod
    def supports_ssml(self) -> bool:
        """是否支持 SSML"""
        pass

    @property
    @abstractmethod
    def supports_streaming(self) -> bool:
        """是否支持流式输出"""
        pass
```

### 5.2 腾讯云 TTS 实现

```python
# backend/app/services/tts/tencent.py

from tencentcloud.common import credential
from tencentcloud.tts.v20190823 import tts_client, models
import base64

class TencentTTSProvider(BaseTTSProvider):

    name = "tencent_cloud"
    supports_ssml = True
    supports_streaming = True

    def __init__(self, secret_id: str, secret_key: str, region: str = "ap-guangzhou"):
        cred = credential.Credential(secret_id, secret_key)
        self.client = tts_client.TtsClient(cred, region)

    async def synthesize(self, request: TTSRequest) -> TTSResponse:
        """合成语音"""

        # 构建请求
        req = models.TextToVoiceRequest()
        req.Text = request.text
        req.VoiceType = self._map_voice_id(request.voice_id)
        req.Speed = request.speed
        req.Volume = 0  # 0为正常音量
        req.Codec = "mp3"
        req.SampleRate = request.sample_rate

        # 情感控制（如果支持）
        if request.emotion and request.voice_id.startswith("premium-"):
            req.EmotionCategory = request.emotion

        # 调用 API
        resp = self.client.TextToVoice(req)

        # 解码音频
        audio_data = base64.b64decode(resp.Audio)

        # 估算时长（中文200字/分钟）
        duration = len(request.text) / 200 * 60

        # 计算成本
        cost = self.estimate_cost(request.text)

        return TTSResponse(
            audio_data=audio_data,
            duration=duration,
            cost=cost,
            provider=self.name,
            voice_used=request.voice_id
        )

    def get_voices(self) -> List[Dict]:
        """获取音色列表"""
        return [
            {"id": "101001", "name": "智瑜", "gender": "female", "language": "zh", "type": "basic"},
            {"id": "101002", "name": "智聆", "gender": "female", "language": "zh", "type": "basic"},
            {"id": "premium-1", "name": "灵悦", "gender": "female", "language": "zh", "type": "premium", "emotion": True},
            # ... 更多音色
        ]

    def estimate_cost(self, text: str) -> float:
        """估算成本（¥2/万字符）"""
        chars = len(text)
        return chars / 10000 * 2 * 0.14  # 转换为美元

    def check_quota(self) -> Dict:
        """检查配额（需要调用腾讯云计费API）"""
        # 这里简化处理
        return {
            "free_quota_remaining": 8000000,  # 示例：800万字符
            "used_this_month": 0
        }

    def _map_voice_id(self, voice_id: str) -> int:
        """映射音色 ID"""
        mapping = {
            "zhiyu": 101001,
            "zhiling": 101002,
            # ...
        }
        return mapping.get(voice_id, 101001)
```

### 5.3 OpenAI TTS 实现

```python
# backend/app/services/tts/openai.py

from openai import AsyncOpenAI

class OpenAITTSProvider(BaseTTSProvider):

    name = "openai"
    supports_ssml = False
    supports_streaming = True

    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)

    async def synthesize(self, request: TTSRequest) -> TTSResponse:
        """合成语音"""

        # 选择模型
        model = "tts-1-hd" if "hd" in request.voice_id else "tts-1"

        # 映射音色
        voice = self._map_voice(request.voice_id)

        # 调用 API
        response = await self.client.audio.speech.create(
            model=model,
            voice=voice,
            input=request.text,
            response_format=request.output_format,
            speed=request.speed
        )

        audio_data = response.content

        # 估算时长
        duration = len(request.text) / 200 * 60

        # 计算成本
        cost = self.estimate_cost(request.text)

        return TTSResponse(
            audio_data=audio_data,
            duration=duration,
            cost=cost,
            provider=self.name,
            voice_used=voice
        )

    def get_voices(self) -> List[Dict]:
        """OpenAI 提供 6 个音色"""
        return [
            {"id": "alloy", "name": "Alloy", "gender": "neutral"},
            {"id": "echo", "name": "Echo", "gender": "male"},
            {"id": "fable", "name": "Fable", "gender": "neutral"},
            {"id": "onyx", "name": "Onyx", "gender": "male"},
            {"id": "nova", "name": "Nova", "gender": "female"},
            {"id": "shimmer", "name": "Shimmer", "gender": "female"},
        ]

    def estimate_cost(self, text: str) -> float:
        """OpenAI: $0.015/1K chars (tts-1), $0.03/1K chars (tts-1-hd)"""
        chars = len(text)
        return chars / 1000 * 0.015  # 假设使用 tts-1

    def check_quota(self) -> Dict:
        """OpenAI 无免费额度"""
        return {"free_quota_remaining": 0}

    def _map_voice(self, voice_id: str) -> str:
        """映射音色"""
        if voice_id in ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]:
            return voice_id
        return "alloy"  # 默认
```

### 5.4 路由器实现

```python
# backend/app/services/tts/router.py

from typing import Dict, List
from .base import BaseTTSProvider, TTSRequest, TTSResponse
from .tencent import TencentTTSProvider
from .openai import OpenAITTSProvider
from .azure import AzureTTSProvider

class TTSRouter:
    """TTS 供应商路由器"""

    def __init__(self, providers: Dict[str, BaseTTSProvider]):
        self.providers = providers
        self.priority_order = ["tencent", "google", "amazon", "azure"]

    async def synthesize(
        self,
        request: TTSRequest,
        user_plan: str = "free"
    ) -> TTSResponse:
        """智能路由合成"""

        # 1. 选择供应商
        provider_name = self._select_provider(request, user_plan)
        provider = self.providers[provider_name]

        # 2. 尝试合成
        try:
            response = await provider.synthesize(request)
            return response
        except Exception as e:
            # 3. 失败时自动切换到备用供应商
            print(f"Provider {provider_name} failed: {e}")
            return await self._fallback_synthesize(request, exclude=provider_name)

    def _select_provider(self, request: TTSRequest, user_plan: str) -> str:
        """选择最佳供应商"""

        # 免费用户：优先使用免费额度
        if user_plan == "free":
            for provider_name in self.priority_order:
                if provider_name not in self.providers:
                    continue
                quota = self.providers[provider_name].check_quota()
                if quota.get("free_quota_remaining", 0) > 0:
                    return provider_name
            # 如果都没有免费额度，使用最便宜的
            return "azure"

        # Pro 用户：根据音质需求
        if "ultra" in request.voice_id:
            return "openai"

        # 特殊功能需求
        if request.emotion:
            return "tencent"

        # 默认
        return "azure"

    async def _fallback_synthesize(
        self,
        request: TTSRequest,
        exclude: str
    ) -> TTSResponse:
        """备用供应商合成"""
        for provider_name in self.priority_order:
            if provider_name == exclude or provider_name not in self.providers:
                continue
            try:
                provider = self.providers[provider_name]
                return await provider.synthesize(request)
            except Exception as e:
                print(f"Fallback provider {provider_name} failed: {e}")
                continue

        raise Exception("All TTS providers failed")
```

### 5.5 使用示例

```python
# backend/app/api/tts.py

from fastapi import APIRouter, Depends
from app.services.tts.router import TTSRouter
from app.services.tts.tencent import TencentTTSProvider
from app.services.tts.openai import OpenAITTSProvider
from app.core.config import settings

router = APIRouter()

# 初始化供应商
providers = {
    "tencent": TencentTTSProvider(
        secret_id=settings.TENCENT_SECRET_ID,
        secret_key=settings.TENCENT_SECRET_KEY
    ),
    "openai": OpenAITTSProvider(
        api_key=settings.OPENAI_API_KEY
    ),
    # ... 更多供应商
}

tts_router = TTSRouter(providers)

@router.post("/tts/generate")
async def generate_tts(
    text: str,
    voice_id: str,
    user: User = Depends(get_current_user)
):
    """生成 TTS 音频"""

    request = TTSRequest(
        text=text,
        voice_id=voice_id,
        speed=1.0,
        language="zh-CN"
    )

    response = await tts_router.synthesize(
        request,
        user_plan=user.plan
    )

    # 保存到数据库
    await save_audio(
        user_id=user.id,
        audio_data=response.audio_data,
        duration=response.duration,
        cost=response.cost,
        provider=response.provider
    )

    return {
        "audio_url": upload_to_s3(response.audio_data),
        "duration": response.duration,
        "provider": response.provider
    }
```

---

## 六、监控与成本控制

### 6.1 使用量追踪

```python
# backend/app/services/tts/usage_tracker.py

class TTSUsageTracker:
    """TTS 使用量追踪"""

    async def log_usage(
        self,
        user_id: str,
        provider: str,
        text_length: int,
        cost: float,
        duration: float
    ):
        """记录使用"""
        await db.tts_usage_logs.insert({
            "user_id": user_id,
            "provider": provider,
            "text_length": text_length,
            "cost": cost,
            "duration": duration,
            "created_at": datetime.utcnow()
        })

    async def get_daily_cost(self) -> float:
        """获取今日总成本"""
        result = await db.tts_usage_logs.aggregate([
            {"$match": {"created_at": {"$gte": today_start}}},
            {"$group": {"_id": None, "total": {"$sum": "$cost"}}}
        ])
        return result[0]["total"] if result else 0.0

    async def get_provider_usage(self, days: int = 30) -> Dict:
        """获取各供应商使用情况"""
        result = await db.tts_usage_logs.aggregate([
            {"$match": {"created_at": {"$gte": days_ago(days)}}},
            {
                "$group": {
                    "_id": "$provider",
                    "total_requests": {"$sum": 1},
                    "total_chars": {"$sum": "$text_length"},
                    "total_cost": {"$sum": "$cost"}
                }
            }
        ])
        return result
```

### 6.2 配额告警

```python
# backend/app/services/tts/quota_monitor.py

class QuotaMonitor:
    """配额监控"""

    async def check_quotas(self):
        """检查所有供应商配额"""
        alerts = []

        for provider_name, provider in providers.items():
            quota = provider.check_quota()
            remaining = quota.get("free_quota_remaining", 0)

            # 配额低于10%时告警
            if remaining > 0 and remaining < provider.monthly_quota * 0.1:
                alerts.append({
                    "provider": provider_name,
                    "remaining": remaining,
                    "severity": "warning"
                })

            # 配额耗尽时告警
            if remaining == 0:
                alerts.append({
                    "provider": provider_name,
                    "remaining": 0,
                    "severity": "critical"
                })

        # 发送告警
        if alerts:
            await send_alert_to_slack(alerts)
```

---

## 七、迁移与切换策略

### 7.1 供应商切换流程

```
1. 准备阶段
   - 在新供应商注册账号
   - 测试 API 可用性
   - 配置环境变量

2. 逐步切换（灰度发布）
   - Week 1: 10% 流量切换到新供应商
   - Week 2: 30% 流量
   - Week 3: 70% 流量
   - Week 4: 100% 流量

3. 监控指标
   - 成功率
   - 音质反馈
   - 响应时间
   - 成本变化

4. 回滚准备
   - 保留旧供应商配置
   - 一键回滚脚本
   - 数据双写（24小时）
```

### 7.2 成本优化建议

1. **动态路由**：根据实时成本自动选择最便宜的供应商
2. **缓存策略**：常见文本（如欢迎语）提前生成并缓存
3. **批量处理**：合并小段文本减少 API 调用次数
4. **用户分层**：
   - 免费用户：仅使用免费额度供应商
   - Pro 用户：可选高质量供应商
   - 企业用户：自定义供应商配置

---

## 八、供应商选择建议

### 8.1 按场景推荐

| 场景 | 推荐供应商 | 理由 |
|------|-----------|------|
| **MVP 测试** | 腾讯云 | 800万字符免费，支撑长期测试 |
| **中文内容为主** | 腾讯云 / MiniMax | 中文音质最佳 |
| **多语言需求** | Azure / Google | 支持语言最多 |
| **高音质要求** | OpenAI / ElevenLabs | 音质最自然 |
| **成本敏感** | Azure | $0.001/1K chars 最便宜 |
| **声音克隆** | ElevenLabs / Azure | 支持自定义音色 |
| **情感控制** | 腾讯云 / Azure | SSML 支持完善 |
| **企业级稳定性** | Google / Amazon | 99.9% SLA 保证 |

### 8.2 最终推荐配置

```yaml
# 推荐配置 (config/tts-providers.yaml)

providers:
  primary:
    name: tencent_cloud
    reason: 800万字符免费，中文音质好
    usage: 60%

  secondary:
    name: google_cloud
    reason: 400万字符/月持续免费
    usage: 20%

  premium:
    name: openai
    reason: 高音质，Pro 用户专用
    usage: 15%

  fallback:
    name: azure
    reason: 最便宜 ($0.001/1K)，兜底
    usage: 5%

routing_rules:
  - if: user.plan == "free"
    use: ["tencent", "google", "azure"]

  - if: user.plan == "pro" && quality == "ultra"
    use: ["openai", "minimax"]

  - if: feature == "voice_cloning"
    use: ["elevenlabs", "azure"]

  - if: language == "zh-CN"
    prefer: ["tencent", "minimax"]

  - if: language != "zh-CN"
    prefer: ["google", "azure", "amazon"]

cost_control:
  daily_limit: $50
  alert_threshold: $40
  auto_fallback: true
```

---

## 九、参考资源

### 9.1 官方文档

- **腾讯云 TTS**: https://cloud.tencent.com/document/product/1073
- **MiniMax**: https://platform.minimax.io/docs
- **Google Cloud TTS**: https://cloud.google.com/text-to-speech
- **Amazon Polly**: https://aws.amazon.com/polly/
- **Azure TTS**: https://azure.microsoft.com/en-us/products/ai-services/text-to-speech
- **OpenAI TTS**: https://platform.openai.com/docs/guides/text-to-speech
- **ElevenLabs**: https://elevenlabs.io/docs

### 9.2 SDK 库

```bash
# Python
pip install tencentcloud-sdk-python  # 腾讯云
pip install openai                    # OpenAI
pip install azure-cognitiveservices-speech  # Azure
pip install boto3                     # Amazon Polly
pip install google-cloud-texttospeech  # Google Cloud
```

---

**最后更新**: 2026-01-09
**维护者**: AIMake 技术团队
