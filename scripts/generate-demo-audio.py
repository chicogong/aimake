#!/usr/bin/env python3
"""
生成演示音频文件
使用 edge-tts（微软 Edge 免费语音服务）
"""

import sys
import asyncio
from pathlib import Path

# 检查是否安装了 edge-tts
try:
    import edge_tts
except ImportError:
    print("❌ 请先安装 edge-tts:")
    print("   pip install edge-tts")
    sys.exit(1)


class EdgeTTS:
    """Edge TTS 客户端"""

    def __init__(self):
        self.client = edge_tts

    async def synthesize(
        self,
        text: str,
        voice: str = "zh-CN-XiaoxiaoNeural",
        rate: str = "+0%",
        volume: str = "+0%",
    ) -> bytes:
        """合成语音

        Args:
            text: 要合成的文本
            voice: 音色名称
            rate: 语速（如 "+20%" 或 "-10%"）
            volume: 音量（如 "+50%" 或 "-20%"）

        Returns:
            音频数据（bytes）
        """
        communicate = edge_tts.Communicate(
            text=text,
            voice=voice,
            rate=rate,
            volume=volume
        )

        # 保存到内存
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]

        return audio_data


# 演示音频文本内容
DEMO_TEXTS = {
    "demo-podcast.mp3": {
        "text": "大家好，欢迎收听本期播客。今天我们来聊一个有趣的话题：人工智能如何改变内容创作。AI 语音合成技术的发展，让任何人都能快速生成专业级的音频内容，无需昂贵的录音设备或配音演员。这不仅降低了创作门槛，也为内容创作者提供了全新的可能性。",
        "voice": "zh-CN-XiaoxiaoNeural",  # 女声，温柔
        "rate": "+0%",
        "description": "播客对话 · 两位主播自然对话"
    },
    "demo-audiobook.mp3": {
        "text": "那是一个宁静的午后，阳光透过窗棂洒在书桌上。她轻轻翻开那本泛黄的日记，里面记载着许多年前的故事。每一个字都像是时光的脚印，带她回到那些温暖而难忘的时刻。她闭上眼睛，仿佛又听到了当年的欢声笑语。",
        "voice": "zh-CN-XiaoyiNeural",  # 女声，温柔适合朗读
        "rate": "-10%",  # 稍慢
        "description": "小说片段 · 富有情感的朗读"
    },
    "demo-voiceover.mp3": {
        "text": "AIMake，AI 驱动的语音内容生成平台。只需输入文字，即可获得专业的音频内容。支持播客对话、有声书、视频配音等多种场景。让创作更简单，让声音更动听。立即体验，开启你的 AI 创作之旅。",
        "voice": "zh-CN-YunyangNeural",  # 男声，专业
        "rate": "+10%",
        "description": "产品介绍 · 专业解说音"
    },
    "demo-tutorial.mp3": {
        "text": "接下来我们学习如何使用 Python 处理数据。首先，导入 pandas 库。然后，使用 read underscore csv 函数读取数据文件。接着，我们可以使用 head 方法查看前几行数据。最后，使用 describe 方法获取数据的统计摘要。这些是数据分析的基础操作。",
        "voice": "zh-CN-XiaoxiaoNeural",  # 女声，清晰
        "rate": "+0%",
        "description": "编程教学 · 清晰易懂"
    }
}


async def main():
    # 初始化 TTS 客户端
    print("🎙️  初始化 Edge TTS 客户端...")
    tts = EdgeTTS()

    # 输出目录
    output_dir = Path(__file__).parent.parent / "landing" / "assets" / "audio"
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"📁 输出目录: {output_dir}")
    print()

    # 生成每个演示音频
    for filename, config in DEMO_TEXTS.items():
        print(f"⏳ 正在生成: {filename}")
        print(f"   文本: {config['text'][:50]}...")
        print(f"   音色: {config['voice']}")

        try:
            # 调用 TTS API
            audio_data = await tts.synthesize(
                text=config["text"],
                voice=config["voice"],
                rate=config["rate"],
            )

            # 保存音频文件
            output_path = output_dir / filename
            with open(output_path, "wb") as f:
                f.write(audio_data)

            file_size = len(audio_data) / 1024  # KB
            print(f"✅ 成功生成: {output_path} ({file_size:.1f} KB)")
            print(f"   {config['description']}")
            print()

        except Exception as e:
            print(f"❌ 生成失败: {e}")
            print()

    print("🎉 所有音频文件生成完成！")
    print()
    print("📂 文件位置:")
    for filename in DEMO_TEXTS.keys():
        print(f"   - landing/assets/audio/{filename}")


if __name__ == "__main__":
    asyncio.run(main())
