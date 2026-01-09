# TTS 免费供应商快速接入指南

> 创建日期: 2026-01-09
> 目标: 快速上线，优先使用免费 API

---

## 一、TTS 供应商（免费额度最大）

### 1.1 腾讯云 TTS ⭐ 最推荐

**免费额度**: 新用户送 800万字符（基础/精品音色，3个月有效）

**优势**:
- 免费额度最大（800万字符 = 4万分钟音频）
- 中文音质优秀，情感控制好
- 150+ 音色，支持多语言
- 价格低：¥2/万字符（$0.28/1K）

**快速接入**:

```python
# 安装 SDK
pip install tencentcloud-sdk-python

from tencentcloud.common import credential
from tencentcloud.tts.v20190823 import tts_client, models
import base64

class TencentTTS:
    def __init__(self, secret_id: str, secret_key: str):
        cred = credential.Credential(secret_id, secret_key)
        self.client = tts_client.TtsClient(cred, "ap-guangzhou")

    def synthesize(self, text: str, voice_type: int = 101001, speed: float = 0) -> bytes:
        """合成语音

        Args:
            text: 要合成的文本
            voice_type: 音色 ID（101001=智瑜, 101002=智聆）
            speed: 语速 (-2 ~ 2)

        Returns:
            音频数据（bytes）
        """
        req = models.TextToVoiceRequest()
        req.Text = text
        req.VoiceType = voice_type
        req.Speed = speed
        req.Volume = 0  # 音量（-10 ~ 10）
        req.Codec = "mp3"
        req.SampleRate = 24000  # 24kHz

        resp = self.client.TextToVoice(req)
        audio_data = base64.b64decode(resp.Audio)

        return audio_data

# 使用
tts = TencentTTS(
    secret_id="your-secret-id",
    secret_key="your-secret-key"
)

audio = tts.synthesize("你好，欢迎使用 AIMake！", voice_type=101001)

# 保存为文件
with open("output.mp3", "wb") as f:
    f.write(audio)
```

**推荐音色**:
- **101001 (智瑜)**: 女声，温柔自然
- **101002 (智聆)**: 女声，亲切温暖
- **101003 (智美)**: 女声，甜美可爱
- **101004 (智云)**: 男声，沉稳大气
- **精品音色**: 支持情感控制（高兴、伤心、愤怒等）

**注册**: https://cloud.tencent.com/product/tts

---

### 1.2 Google Cloud TTS

**免费额度**:
- 标准音色：400万字符/月（持续免费）
- WaveNet：100万字符/月（持续免费）

**优势**:
- 持续免费，无需担心过期
- 220+ 音色，支持 40+ 语言
- WaveNet 音质优秀
- 新用户送 $300 代金券

**快速接入**:

```python
# 安装 SDK
pip install google-cloud-texttospeech

from google.cloud import texttospeech

class GoogleTTS:
    def __init__(self, credentials_path: str):
        self.client = texttospeech.TextToSpeechClient.from_service_account_file(
            credentials_path
        )

    def synthesize(
        self,
        text: str,
        language_code: str = "zh-CN",
        voice_name: str = "zh-CN-Wavenet-A",
        speaking_rate: float = 1.0
    ) -> bytes:
        """合成语音"""

        # 设置输入文本
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # 选择音色
        voice = texttospeech.VoiceSelectionParams(
            language_code=language_code,
            name=voice_name
        )

        # 选择音频格式
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=speaking_rate,
            pitch=0.0  # 音调 (-20.0 ~ 20.0)
        )

        # 调用 API
        response = self.client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        return response.audio_content

# 使用
tts = GoogleTTS(credentials_path="path/to/credentials.json")
audio = tts.synthesize("Hello, welcome to AIMake!", voice_name="en-US-Neural2-A")

with open("output.mp3", "wb") as f:
    f.write(audio)
```

**推荐音色**:
- **zh-CN-Wavenet-A**: 中文女声（WaveNet）
- **zh-CN-Wavenet-B**: 中文男声（WaveNet）
- **en-US-Neural2-A**: 英文女声（Neural）
- **en-US-Neural2-D**: 英文男声（Neural）

**注册**: https://cloud.google.com/text-to-speech

---

### 1.3 Amazon Polly

**免费额度**:
- 标准音色：500万字符/月（持续免费）
- Neural 音色：100万字符/月（12个月）

**优势**:
- 免费额度大且持续
- Neural 音色自然流畅
- 60+ 音色，支持 30+ 语言
- SSML 支持完善

**快速接入**:

```python
# 安装 SDK
pip install boto3

import boto3

class AmazonPollyTTS:
    def __init__(self, access_key_id: str, secret_access_key: str, region: str = "us-east-1"):
        self.client = boto3.client(
            'polly',
            aws_access_key_id=access_key_id,
            aws_secret_access_key=secret_access_key,
            region_name=region
        )

    def synthesize(
        self,
        text: str,
        voice_id: str = "Zhiyu",
        engine: str = "neural"
    ) -> bytes:
        """合成语音

        Args:
            text: 文本
            voice_id: 音色 ID（Zhiyu=中文女声）
            engine: 引擎（standard 或 neural）
        """
        response = self.client.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId=voice_id,
            Engine=engine
        )

        return response['AudioStream'].read()

# 使用
tts = AmazonPollyTTS(
    access_key_id="your-access-key",
    secret_access_key="your-secret-key"
)

audio = tts.synthesize("你好，欢迎使用 AIMake！", voice_id="Zhiyu", engine="neural")

with open("output.mp3", "wb") as f:
    f.write(audio)
```

**推荐音色**:
- **Zhiyu**: 中文女声（Neural）
- **Joanna**: 英文女声（Neural）
- **Matthew**: 英文男声（Neural）
- **Takumi**: 日语男声（Neural）

**注册**: https://aws.amazon.com/polly/

---

### 1.4 Azure TTS

**免费额度**: 500万字符/月（12个月）

**优势**:
- 400+ 音色，支持 110+ 语言
- Neural 音色质量高
- 价格最低：$0.001/1K chars（标准音色）
- SSML 和情感控制完善

**快速接入**:

```python
# 安装 SDK
pip install azure-cognitiveservices-speech

import azure.cognitiveservices.speech as speechsdk

class AzureTTS:
    def __init__(self, subscription_key: str, region: str = "eastus"):
        self.speech_config = speechsdk.SpeechConfig(
            subscription=subscription_key,
            region=region
        )

    def synthesize(
        self,
        text: str,
        voice_name: str = "zh-CN-XiaoxiaoNeural",
        speaking_rate: float = 1.0
    ) -> bytes:
        """合成语音"""

        # 设置音色
        self.speech_config.speech_synthesis_voice_name = voice_name

        # 创建合成器（输出到内存）
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=self.speech_config,
            audio_config=None
        )

        # 使用 SSML 控制语速
        ssml = f"""
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'>
            <voice name='{voice_name}'>
                <prosody rate='{speaking_rate}'>
                    {text}
                </prosody>
            </voice>
        </speak>
        """

        result = synthesizer.speak_ssml_async(ssml).get()

        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return result.audio_data
        else:
            raise Exception(f"Speech synthesis failed: {result.reason}")

# 使用
tts = AzureTTS(
    subscription_key="your-subscription-key",
    region="eastus"
)

audio = tts.synthesize("你好，欢迎使用 AIMake！", voice_name="zh-CN-XiaoxiaoNeural")

with open("output.mp3", "wb") as f:
    f.write(audio)
```

**推荐音色**:
- **zh-CN-XiaoxiaoNeural**: 中文女声，温柔
- **zh-CN-YunyangNeural**: 中文男声，专业
- **en-US-JennyNeural**: 英文女声，友好
- **en-US-GuyNeural**: 英文男声，成熟

**注册**: https://azure.microsoft.com/en-us/products/ai-services/text-to-speech

---

## 二、TTS 推荐策略

### MVP 阶段（快速上线）

```yaml
主力: 腾讯云 TTS
  理由:
    - 800万字符免费额度（最大）
    - 中文音质优秀
    - 3个月有效期（够 MVP 测试）
    - 150+ 音色选择

备用: Google Cloud TTS
  理由:
    - 400万字符/月持续免费
    - 多语言支持好
    - 主力用完自动切换

付费兜底: Azure TTS
  理由:
    - 价格最低（$0.001/1K chars）
    - 免费额度用完后成本可控

使用场景:
  - 基础 TTS: 腾讯云/Google（免费）
  - 高音质: OpenAI TTS（付费）
  - 声音克隆: ElevenLabs（付费）
```

### 统一配置（环境变量）

```bash
# .env

# TTS 配置
TTS_PROVIDER=tencent  # 或 google, amazon, azure

# 腾讯云
TENCENT_SECRET_ID=your-secret-id
TENCENT_SECRET_KEY=your-secret-key

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Amazon Polly
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Azure
AZURE_SPEECH_KEY=your-subscription-key
AZURE_SPEECH_REGION=eastus

# 备用 TTS
TTS_FALLBACK_PROVIDER=google
```

### 统一封装

```python
# backend/app/services/tts/client.py

from app.core.config import settings
from .tencent import TencentTTS
from .google import GoogleTTS
from .azure import AzureTTS

class TTSClient:
    """统一 TTS 客户端"""

    def __init__(self):
        # 主力供应商
        self.primary = TencentTTS(
            secret_id=settings.TENCENT_SECRET_ID,
            secret_key=settings.TENCENT_SECRET_KEY
        )

        # 备用供应商
        self.fallback = GoogleTTS(
            credentials_path=settings.GOOGLE_APPLICATION_CREDENTIALS
        )

    async def synthesize(
        self,
        text: str,
        voice_id: str = "zhiyu",
        speed: float = 1.0
    ) -> bytes:
        """统一的合成接口"""

        try:
            # 尝试主力供应商
            audio_data = self.primary.synthesize(
                text=text,
                voice_type=self._map_voice_id(voice_id),
                speed=speed - 1.0  # 腾讯云 speed 范围是 -2~2
            )
            return audio_data

        except Exception as e:
            print(f"Primary TTS failed: {e}, switching to fallback")

            # 自动切换到备用
            audio_data = self.fallback.synthesize(
                text=text,
                voice_name=self._map_google_voice(voice_id),
                speaking_rate=speed
            )
            return audio_data

    def _map_voice_id(self, voice_id: str) -> int:
        """映射音色 ID"""
        mapping = {
            "zhiyu": 101001,  # 智瑜（女声）
            "zhiling": 101002,  # 智聆（女声）
            "zhiyun": 101004,  # 智云（男声）
        }
        return mapping.get(voice_id, 101001)

    def _map_google_voice(self, voice_id: str) -> str:
        """映射 Google 音色"""
        mapping = {
            "zhiyu": "zh-CN-Wavenet-A",
            "zhiling": "zh-CN-Wavenet-A",
            "zhiyun": "zh-CN-Wavenet-B",
        }
        return mapping.get(voice_id, "zh-CN-Wavenet-A")

# 使用示例
tts = TTSClient()

audio = await tts.synthesize(
    text="你好，欢迎使用 AIMake！",
    voice_id="zhiyu",
    speed=1.2
)
```

---

## 三、成本估算

### TTS 成本（生成 1 小时音频）

```
1小时音频 = 约 12,000 中文字符

使用腾讯云:
  - 免费额度: 800万字符 = 666小时音频
  - 付费: 12,000字符 × ¥2/万字符 = ¥2.4 ≈ $0.34

使用 Google Cloud:
  - 免费: 400万字符/月 = 333小时/月
  - 付费: 12,000 × $0.004 = $0.048

使用 Azure:
  - 免费: 500万字符/月 = 416小时/月
  - 付费: 12,000 × $0.001 = $0.012（最便宜）

对比 OpenAI TTS:
  - 价格: 12,000 × $0.015 = $0.18
  - 贵 15倍（相比 Azure）
```

### 总成本（1000个用户/月）

```
场景: 每人生成 10分钟音频

总需求:
  - 1000用户 × 10分钟 = 10,000分钟
  - 约 200万字符

使用腾讯云:
  - 免费额度: 800万字符（完全覆盖）
  - 月成本: $0

使用 Google Cloud:
  - 免费额度: 400万字符/月（完全覆盖）
  - 月成本: $0

使用 Azure（付费）:
  - 成本: 200万 × $0.001 = $2

结论: MVP 阶段 TTS 成本为 $0
```

---

## 四、快速上线配置

### 推荐配置（最小成本）

```yaml
# MVP 配置

TTS:
  primary: 腾讯云 TTS
    - 800万字符免费
    - 中文音质优秀
    - 3个月有效期

  fallback: Google Cloud TTS
    - 400万字符/月持续免费
    - 多语言支持
    - 主力用完自动切换

  paid_fallback: Azure TTS
    - 价格最低（$0.001/1K）
    - 免费额度用完后成本可控

预计月成本: $0-2
  - 1000 用户以内: $0（免费额度充足）
  - 1000-5000 用户: $0-10
```

---

## 五、注册链接汇总

| 服务 | 注册链接 | 免费额度 |
|------|---------|---------|
| **腾讯云 TTS** | https://cloud.tencent.com/product/tts | 800万字符（3个月） |
| **Google Cloud TTS** | https://cloud.google.com/text-to-speech | 400万字符/月 |
| **Amazon Polly** | https://aws.amazon.com/polly/ | 500万字符/月 |
| **Azure TTS** | https://azure.microsoft.com/products/ai-services/text-to-speech | 500万字符/月（12个月） |

---

## 六、使用建议

### 快速上线策略

1. **先注册腾讯云和 Google Cloud**（最大免费额度）
2. **优先用腾讯云**（800万字符够 MVP 阶段）
3. **设置自动切换**（主力失败自动切换到 Google）
4. **监控使用量**（每日检查剩余额度）
5. **额度预警**（剩余 <10% 时告警）

### 音质选择

```python
# 根据场景选择音色

# 播客、有声书（需要温暖自然）
voice = "101001"  # 腾讯云 智瑜

# 新闻、资讯（需要专业稳重）
voice = "101004"  # 腾讯云 智云

# 客服、教程（需要亲切友好）
voice = "101002"  # 腾讯云 智聆

# 高音质需求（Pro 用户）
provider = "openai"
voice = "nova"  # OpenAI TTS
```

---

**最后更新**: 2026-01-09
**维护者**: AIMake 技术团队
