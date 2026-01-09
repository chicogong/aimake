# LLM 和 ASR 免费供应商快速接入指南

> 创建日期: 2026-01-09
> 目标: 快速上线，优先使用免费 API

---

## 一、LLM 供应商（OpenAI 兼容）

### 1.1 硅基流动 (SiliconFlow)

**免费额度**: 新用户送 2000万 tokens（约可生成 1000 次播客对话脚本）

**优势**:
- 完全兼容 OpenAI API，一行代码切换
- 支持 Qwen、DeepSeek、GLM 等国产模型
- 价格超低：¥0.70/百万 tokens（GPT-4 的 1/50）
- 国内访问速度快

**快速接入**:

```python
# 安装 OpenAI SDK
pip install openai

# 替换 base_url 和 api_key 即可
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxx",  # 硅基流动 API Key
    base_url="https://api.siliconflow.cn/v1"
)

# 完全一样的调用方式
response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",  # 或 deepseek-ai/DeepSeek-V2.5
    messages=[
        {"role": "system", "content": "你是一位专业的播客编剧"},
        {"role": "user", "content": "根据这篇文章生成播客对话：..."}
    ]
)

print(response.choices[0].message.content)
```

**推荐模型**:
- **Qwen/Qwen2.5-7B-Instruct**: 中文能力强，速度快
- **deepseek-ai/DeepSeek-V2.5**: 推理能力强，适合复杂任务
- **THUDM/glm-4-9b-chat**: GLM-4，对话自然

**注册**: https://siliconflow.cn

---

### 1.2 DeepSeek API（官方）

**免费额度**: 新用户送 500万 tokens

**优势**:
- DeepSeek-V3 推理能力接近 GPT-4
- 价格：¥1/百万 tokens（输入），¥2/百万 tokens（输出）
- OpenAI 兼容

**快速接入**:

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxx",  # DeepSeek API Key
    base_url="https://api.deepseek.com/v1"
)

response = client.chat.completions.create(
    model="deepseek-chat",  # DeepSeek-V3
    messages=[
        {"role": "system", "content": "你是一位专业的内容分析师"},
        {"role": "user", "content": "分析这篇文章的核心观点：..."}
    ]
)
```

**注册**: https://platform.deepseek.com

---

### 1.3 阿里云百炼

**免费额度**: 新用户送 100万 tokens

**优势**:
- 通义千问 Qwen2.5 系列
- 阿里云生态，稳定性高
- 支持 OpenAI SDK

**快速接入**:

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxx",  # 阿里云 API Key
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

response = client.chat.completions.create(
    model="qwen-turbo",  # 或 qwen-plus, qwen-max
    messages=[{"role": "user", "content": "生成播客对话"}]
)
```

**注册**: https://bailian.console.aliyun.com/

---

### 1.4 Moonshot AI (Kimi)

**免费额度**: 新用户送 15元代金券

**优势**:
- 长文本处理能力强（200K context）
- 适合有声书、长文章转播客
- OpenAI 兼容

**快速接入**:

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-xxxx",
    base_url="https://api.moonshot.cn/v1"
)

response = client.chat.completions.create(
    model="moonshot-v1-8k",  # 或 moonshot-v1-32k, moonshot-v1-128k
    messages=[{"role": "user", "content": "总结这篇长文：..."}]
)
```

**注册**: https://platform.moonshot.cn/

---

### 1.5 智谱 AI (GLM)

**免费额度**: 新用户送 1000万 tokens

**优势**:
- GLM-4 系列，清华团队出品
- 免费额度最大
- OpenAI 兼容

**快速接入**:

```python
from openai import OpenAI

client = OpenAI(
    api_key="xxxx.xxxx",  # 智谱 API Key
    base_url="https://open.bigmodel.cn/api/paas/v4"
)

response = client.chat.completions.create(
    model="glm-4-flash",  # 或 glm-4-plus
    messages=[{"role": "user", "content": "你好"}]
)
```

**注册**: https://open.bigmodel.cn/

---

## 二、LLM 推荐策略

### MVP 阶段（快速上线）

```yaml
主力模型: 硅基流动 - Qwen/Qwen2.5-7B-Instruct
  理由:
    - 2000万 tokens 免费额度（最大）
    - 中文能力强
    - 速度快（生成对话脚本 < 5秒）
    - OpenAI 兼容，无需改代码

备用模型: 智谱 GLM-4-flash
  理由:
    - 1000万 tokens 免费
    - 主力用完切换

高质量场景: DeepSeek-V3
  理由:
    - 推理能力强
    - 适合复杂播客对话生成
    - 价格低（¥1/百万 tokens）

长文本场景: Moonshot moonshot-v1-128k
  理由:
    - 200K context，处理整本小说
    - 适合有声书生成
```

### 统一配置（环境变量）

```bash
# .env

# LLM 配置
LLM_PROVIDER=siliconflow  # 或 deepseek, zhipu, moonshot
LLM_API_KEY=sk-xxxx
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=Qwen/Qwen2.5-7B-Instruct

# 备用 LLM
LLM_FALLBACK_PROVIDER=zhipu
LLM_FALLBACK_API_KEY=xxxx.xxxx
LLM_FALLBACK_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_FALLBACK_MODEL=glm-4-flash
```

### 统一封装

```python
# backend/app/services/llm/client.py

from openai import OpenAI
from app.core.config import settings

class LLMClient:
    """统一 LLM 客户端"""

    def __init__(self):
        self.primary = OpenAI(
            api_key=settings.LLM_API_KEY,
            base_url=settings.LLM_BASE_URL
        )

        self.fallback = OpenAI(
            api_key=settings.LLM_FALLBACK_API_KEY,
            base_url=settings.LLM_FALLBACK_BASE_URL
        )

    async def chat(
        self,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """统一的对话接口"""

        model = model or settings.LLM_MODEL

        try:
            # 尝试主力模型
            response = self.primary.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content

        except Exception as e:
            print(f"Primary LLM failed: {e}, switching to fallback")

            # 自动切换到备用
            response = self.fallback.chat.completions.create(
                model=settings.LLM_FALLBACK_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content

# 使用示例
llm = LLMClient()

result = await llm.chat(
    messages=[
        {"role": "system", "content": "你是播客编剧"},
        {"role": "user", "content": "生成对话"}
    ]
)
```

---

## 三、ASR 供应商（语音识别）

### 3.1 腾讯云 ASR

**免费额度**:
- 新用户：10小时免费（6个月有效）
- 持续免费：50,000次/月（每次60秒以内）

**优势**:
- 中文识别准确率高
- 支持实时和录音文件识别
- 价格低：录音文件 ¥1.5/小时

**快速接入**:

```python
# 安装 SDK
pip install tencentcloud-sdk-python

from tencentcloud.common import credential
from tencentcloud.asr.v20190614 import asr_client, models
import base64

class TencentASR:
    def __init__(self, secret_id: str, secret_key: str):
        cred = credential.Credential(secret_id, secret_key)
        self.client = asr_client.AsrClient(cred, "ap-guangzhou")

    def recognize_file(self, audio_url: str) -> str:
        """识别音频文件"""

        req = models.CreateRecTaskRequest()
        req.EngineModelType = "16k_zh"  # 中文，16k 采样率
        req.ChannelNum = 1
        req.ResTextFormat = 0  # 0: 文本，1: 带时间戳
        req.SourceType = 0  # 0: URL，1: 本地文件
        req.Url = audio_url

        # 提交任务
        resp = self.client.CreateRecTask(req)
        task_id = resp.Data.TaskId

        # 轮询结果（实际应该用异步）
        import time
        while True:
            query_req = models.DescribeTaskStatusRequest()
            query_req.TaskId = task_id
            query_resp = self.client.DescribeTaskStatus(query_req)

            if query_resp.Data.Status == 2:  # 成功
                return query_resp.Data.Result
            elif query_resp.Data.Status == 3:  # 失败
                raise Exception(query_resp.Data.ErrorMsg)

            time.sleep(1)

    def recognize_realtime(self, audio_bytes: bytes) -> str:
        """实时识别（一句话识别）"""

        req = models.SentenceRecognitionRequest()
        req.EngSerViceType = "16k_zh"
        req.SourceType = 1  # ��音数据
        req.VoiceFormat = "wav"
        req.Data = base64.b64encode(audio_bytes).decode()
        req.DataLen = len(audio_bytes)

        resp = self.client.SentenceRecognition(req)
        return resp.Result

# 使用
asr = TencentASR(
    secret_id="your-secret-id",
    secret_key="your-secret-key"
)

text = asr.recognize_file("https://your-audio.mp3")
print(text)
```

**文档**: https://cloud.tencent.com/document/product/1093

---

### 3.2 阿里云 ASR

**免费额度**:
- 新用户：3个月免费（每月 2小时）
- 持续免费：500次/月

**优势**:
- 识别准确率高
- 支持方言识别
- 价格：¥2.5/小时

**快速接入**:

```python
# 安装 SDK
pip install alibabacloud_nls20180518

from alibabacloud_nls20180518.client import Client
from alibabacloud_tea_openapi import models as open_api_models

class AliyunASR:
    def __init__(self, access_key_id: str, access_key_secret: str):
        config = open_api_models.Config(
            access_key_id=access_key_id,
            access_key_secret=access_key_secret,
            endpoint="nls-meta.cn-shanghai.aliyuncs.com"
        )
        self.client = Client(config)

    def recognize(self, audio_url: str) -> str:
        """识别音频"""
        # 提交任务
        request = {
            "app_key": "your-app-key",
            "file_link": audio_url,
            "enable_words": False
        }

        response = self.client.submit_task(request)
        task_id = response.task_id

        # 查询结果
        while True:
            result = self.client.get_task_result(task_id)
            if result.status == "SUCCESS":
                return result.result
            elif result.status == "FAILED":
                raise Exception(result.error_message)
            time.sleep(1)
```

**文档**: https://help.aliyun.com/document_detail/90727.html

---

### 3.3 字节跳动 火山引擎 ASR

**免费额度**: 新用户送 100小时

**优势**:
- 字节跳动技术
- 免费额度最大
- 适合短视频场景

**快速接入**:

```python
# 安装 SDK
pip install volcengine

from volcengine.speech import Speech

class VolcanoASR:
    def __init__(self, app_id: str, access_token: str):
        self.client = Speech(app_id=app_id, access_token=access_token)

    def recognize(self, audio_url: str) -> str:
        """识别音频"""
        response = self.client.recognize_file(
            audio_url=audio_url,
            format="mp3",
            sample_rate=16000
        )
        return response.result
```

**文档**: https://www.volcengine.com/docs/6561/79824

---

### 3.4 讯飞开放平台 ASR

**免费额度**: 500万字符/年（约 200小时）

**优势**:
- 国内 ASR 老牌厂商
- 准确率高
- 免费额度大且持续

**快速接入**:

```python
# WebSocket 实时识别
import websocket
import json
import base64

class XunfeiASR:
    def __init__(self, app_id: str, api_key: str):
        self.app_id = app_id
        self.api_key = api_key

    def recognize(self, audio_file: str) -> str:
        """识别音频文件"""

        # 连接 WebSocket
        ws_url = self._generate_url()
        ws = websocket.create_connection(ws_url)

        # 发送音频数据
        with open(audio_file, 'rb') as f:
            audio_data = f.read()
            # 分块发送...

        # 接收结果
        result = ""
        while True:
            message = ws.recv()
            data = json.loads(message)
            if data["code"] == 0:
                result += data["data"]["result"]["ws"]
                if data["data"]["status"] == 2:  # 结束
                    break

        ws.close()
        return result
```

**文档**: https://www.xfyun.cn/doc/asr/voicedictation/API.html

---

## 四、ASR 推荐策略

### MVP 阶段

```yaml
主力: 腾讯云 ASR
  理由:
    - 10小时免费（新用户）
    - 50,000次/月持续免费（每次 ≤60秒）
    - 中文准确率高
    - 价格低（¥1.5/小时）

备用: 讯飞 ASR
  理由:
    - 500万字符/年免费（约 200小时）
    - 老牌厂商，稳定

高并发场景: 火山引擎
  理由:
    - 100小时免费
    - 字节技术，适合短视频

使用场景:
  - 播客对话编辑（用户上传音频，AI 转文字后再编辑）
  - 有声书校对（生成的音频转回文字，对比原文）
  - 语音输入（用户语音输入创作需求）
```

### 统一封装

```python
# backend/app/services/asr/client.py

class ASRClient:
    """统一 ASR 客户端"""

    def __init__(self):
        self.tencent = TencentASR(
            secret_id=settings.TENCENT_SECRET_ID,
            secret_key=settings.TENCENT_SECRET_KEY
        )

        self.xunfei = XunfeiASR(
            app_id=settings.XUNFEI_APP_ID,
            api_key=settings.XUNFEI_API_KEY
        )

    async def recognize(
        self,
        audio_url: str,
        provider: str = "tencent"
    ) -> str:
        """统一识别接口"""

        try:
            if provider == "tencent":
                return self.tencent.recognize_file(audio_url)
            elif provider == "xunfei":
                return self.xunfei.recognize(audio_url)
            else:
                raise ValueError(f"Unknown provider: {provider}")

        except Exception as e:
            print(f"ASR failed with {provider}: {e}")
            # 自动切换到备用
            if provider == "tencent":
                return self.xunfei.recognize(audio_url)
            else:
                return self.tencent.recognize_file(audio_url)

# 使用
asr = ASRClient()
text = await asr.recognize("https://audio.mp3")
```

---

## 五、成本估算

### LLM 成本（播客对话生成）

```
单次生成:
  - 输入: 3000 tokens (原文 + Prompt)
  - 输出: 2000 tokens (对话脚本)
  - 总计: 5000 tokens

使用硅基流动 Qwen2.5-7B:
  - 价格: ¥0.70/百万 tokens
  - 单次成本: 5000 / 1,000,000 × 0.70 = ¥0.0035 ≈ $0.0005
  - 2000万免费额度 = 4000 次生成

使用 DeepSeek-V3:
  - 价格: ¥1/百万 (输入) + ¥2/百万 (输出)
  - 单次成��: 3000/1,000,000×1 + 2000/1,000,000×2 = ¥0.007 ≈ $0.001
  - 500万免费额度 = 1000 次生成

对比 OpenAI GPT-4:
  - 价格: $0.01/1K (输入) + $0.03/1K (输出)
  - 单次成本: 3×$0.01 + 2×$0.03 = $0.09
  - 国产模型节省: 99%
```

### ASR 成本

```
1小时音频识别:

腾讯云:
  - 免费: 50,000次/月（每次 ≤60秒）
  - 付费: ¥1.5/小时
  - 60次 × 1分钟 = 1小时免费

讯飞:
  - 免费: 500万字符/年 ≈ 200小时
  - 付费: ¥2/小时

对比 Google Cloud Speech-to-Text:
  - 免费: 60分钟/月
  - 付费: $0.006/15秒 = $1.44/小时
```

### 总成本（1000个用户/月）

```
场景: 每人生成 2次播客（10分钟）+ 识别 1小时音频

LLM 成本:
  - 1000用户 × 2次 = 2000次生成
  - 使用硅基流动: 完全免费（2000万额度可用 4000次）

ASR 成本:
  - 1000用户 × 1小时 = 1000小时
  - 腾讯云 50,000次/月 = 833小时免费
  - 超出 167小时 × ¥1.5 = ¥250.5 ≈ $35

总成本: $35/月（仅 ASR）
```

---

## 六、快速上线配置

### 推荐配置（最小成本）

```yaml
# MVP 配置

LLM:
  primary: 硅基流动 Qwen2.5-7B
    - 2000万 tokens 免费
    - 中文能力强，速度快

  fallback: 智谱 GLM-4-flash
    - 1000万 tokens 免费
    - 主力用完自动切换

ASR:
  primary: 腾讯云 ASR
    - 10小时免费（新用户）
    - 50,000次/月持续免费

  fallback: 讯飞 ASR
    - 500万字符/年免费

预计月成本: $0-35
  - LLM: $0（免费额度充足）
  - ASR: $0-35（看使用量）
```

### 环境变量配置

```bash
# .env.example

# LLM 配置
LLM_PROVIDER=siliconflow
LLM_API_KEY=sk-your-siliconflow-key
LLM_BASE_URL=https://api.siliconflow.cn/v1
LLM_MODEL=Qwen/Qwen2.5-7B-Instruct

LLM_FALLBACK_PROVIDER=zhipu
LLM_FALLBACK_API_KEY=your-zhipu-key.xxxxx
LLM_FALLBACK_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_FALLBACK_MODEL=glm-4-flash

# ASR 配置
ASR_PROVIDER=tencent
TENCENT_SECRET_ID=your-secret-id
TENCENT_SECRET_KEY=your-secret-key

ASR_FALLBACK_PROVIDER=xunfei
XUNFEI_APP_ID=your-app-id
XUNFEI_API_KEY=your-api-key
```

---

## 七、注册链接汇总

| 服务 | 注册链接 | 免费额度 |
|------|---------|---------|
| **硅基流动** | https://siliconflow.cn | 2000万 tokens |
| **DeepSeek** | https://platform.deepseek.com | 500万 tokens |
| **智谱 AI** | https://open.bigmodel.cn | 1000万 tokens |
| **Moonshot** | https://platform.moonshot.cn | 15元代金券 |
| **阿里云百炼** | https://bailian.console.aliyun.com | 100万 tokens |
| **腾讯云 ASR** | https://cloud.tencent.com/product/asr | 10小时 + 50K次/月 |
| **讯飞 ASR** | https://www.xfyun.cn | 500万字符/年 |
| **火山引擎 ASR** | https://www.volcengine.com | 100小时 |

---

## 八、使用建议

### 快速上线策略

1. **先注册所有免费账号**（1小时内完成）
2. **优先用完免费额度最大的**（硅基流动 + 智谱）
3. **设置自动切换**（主力用完自动切换到备用）
4. **监控使用量**（每日检查剩余额度）
5. **额度预警**（剩余 <10% 时告警）

### 后续优化

- **1000 用户以内**: 免费额度够用，零成本
- **1000-5000 用户**: 开始付费，选择最便宜的供应商
- **5000+ 用户**: 考虑自建模型（降低边际成本）

---

**最后更新**: 2026-01-09
**维护者**: AIMake 技术团队
