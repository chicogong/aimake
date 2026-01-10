# AIMake Prompt 工程设计

> 创建日期: 2026-01-09 用于播客对话生成的 Prompt 设计

---

## 一、播客对话生成流程

```
输入内容 → 内容分析 → 对话框架 → 脚本生成 → 脚本优化 → TTS合成
              ↓           ↓           ↓           ↓
           Prompt 1    Prompt 2    Prompt 3    Prompt 4
```

---

## 二、Prompt 模板

### 2.1 内容分析 Prompt

**目的**: 理解输入内容，提取关键信息

````
你是一位专业的内容分析师。请分析以下内容，提取关键信息用于生成播客对话。

## 输入内容
{content}

## 请输出以下信息（JSON格式）

1. **主题**: 一句话概括核心主题
2. **关键观点**: 3-5个核心观点，每个用一句话描述
3. **亮点信息**: 有趣的数据、案例、引用（最多3个）
4. **潜在争议**: 可能引发讨论的观点（如有）
5. **目标受众**: 这个内容适合什么样的听众
6. **情感基调**: 适合的对话风格（轻松/严肃/激动/思考）

## 输出格式
```json
{
  "topic": "...",
  "key_points": ["...", "...", "..."],
  "highlights": ["...", "..."],
  "controversies": ["..."],
  "target_audience": "...",
  "tone": "casual|serious|excited|thoughtful"
}
````

```

---

### 2.2 对话框架 Prompt

**目的**: 生成对话结构和大纲

```

你是一位资深播客编剧。根据以下内容分析结果，设计一个{duration}分钟的双人播客对话框架。

## 内容分析

{analysis_result}

## 角色设定

- **Host（主持人）**: 负责引导话题、提问、总结
- **Guest（嘉宾）**: 负责分享见解、举例、深入分析

## 对话风格

{style} 风格（轻松聊天/专业讨论/辩论探讨）

## 请设计对话框架

### 结构要求

1. **开场** (约10%时长): 寒暄 + 话题引入
2. **主体** (约75%时长): 分3-4个小节讨论要点
3. **收尾** (约15%时长): 总结 + 给听众的建议

### 输出格式

```json
{
  "title": "播客标题",
  "description": "一句话描述",
  "sections": [
    {
      "name": "开场",
      "duration_percent": 10,
      "goal": "引入话题，建立兴趣",
      "key_points": ["问候", "今日话题预告"]
    },
    {
      "name": "第一部分：xxx",
      "duration_percent": 25,
      "goal": "...",
      "key_points": ["...", "..."]
    }
    // ...更多部分
  ],
  "total_turns": 20 // 预计对话回合数
}
```

```

---

### 2.3 脚本生成 Prompt

**目的**: 生成完整对话脚本

```

你是一位专业的播客脚本撰写人。请根据对话框架，生成自然流畅的双人对话脚本。

## 对话框架

{outline}

## 原始内容（供参考）

{original_content}

## 角色声音特点

- **Host**: {host_description}（如：热情开朗的男主持）
- **Guest**: {guest_description}（如：专业温和的女嘉宾）

## 脚本要求

### 语言风格

1. 使用口语化表达，避免书面语
2. 适当使用语气词：嗯、啊、对对对、哇
3. 句子不要太长，适合听觉理解
4. 可以有自然的打断和接话

### 互动要求

1. Host 多提问、多回应
2. Guest 回答后可以反问
3. 有适当的笑声标记 [笑]
4. 有自然的停顿标记 [pause]

### 格式要求

每句对话一行，格式如下： [角色]: 对话内容

## 示例

[Host]: 大家好，欢迎收听今天的节目！今天我们要聊一个特别火的话题。
[Guest]: 对，我也特别期待今天的讨论，因为这个话题真的太有意思了。
[Host]: 那我们先来...

## 请生成完整脚本

```

---

### 2.4 脚本优化 Prompt

**目的**: 优化脚本，确保适合 TTS

```

你是一位TTS优化专家。请优化以下播客脚本，使其更适合文字转语音合成。

## 原始脚本

{script}

## 优化要求

### 1. 处理特殊内容

- 数字：转为中文读法（2024 → 二零二四年）
- 英文：常见词保留，生僻词加注音或替换
- 缩写：展开（AI → A I 或 人工智能）
- 符号：转为文字（% → 百分之）

### 2. 添加语音标记

- [pause:0.5] - 停顿0.5秒
- [pause:1] - 停顿1秒
- [emphasis] 重读词 [/emphasis] - 强调
- [speed:slow] 慢速部分 [/speed] - 语速控制

### 3. 情感标注

在需要情感变化处添加标注：

- (excited) - 兴奋
- (thoughtful) - 思考
- (surprised) - 惊讶
- (serious) - 严肃

### 4. 自然度优化

- 添加填充词：嗯、呃、那个
- 适当重复：对对对、是是是
- 避免过于完美的句子

## 输出格式

```json
{
  "optimized_script": [
    {
      "role": "host",
      "text": "优化后的文本",
      "emotion": "neutral",
      "speed": 1.0
    }
    // ...
  ],
  "total_chars": 1234,
  "estimated_duration": 180
}
```

```

---

## 三、风格模板

### 3.1 轻松聊天风格

```

## 角色设定

- Host: 朋友式的聊天风格，多用"你说是吧"、"我跟你讲"
- Guest: 分享式的表达，多用"我之前..."、"有个特别有意思的..."

## 对话特点

- 多笑声、多感叹
- 可以跑题，然后拉回来
- 使用网络流行语（适度）
- 互相调侃

## 禁忌

- 不要太正式
- 不要太学术
- 不要念稿感

```

### 3.2 专业讨论风格

```

## 角色设定

- Host: 专业主持人，引导深入、总结到位
- Guest: 领域专家，有理有据、逻辑清晰

## 对话特点

- 结构清晰，层层递进
- 引用数据和案例
- 深入分析因果
- 给出可行建议

## 禁忌

- 不要太随意
- 不要没有依据
- 不要偏离主题太远

```

### 3.3 辩论探讨风格

```

## 角色设定

- Host: 持一方观点，善于质疑
- Guest: 持另一方观点，善于辩护

## 对话特点

- 有观点碰撞
- 有礼貌的反驳
- 引用不同证据
- 最终可达成共识或保留分歧

## 禁忌

- 不要人身攻击
- 不要情绪失控
- 不要无理取闹

````

---

## 四、SSML 标记转换

### TTS 平台标记对应表

| 语义 | 通用标记 | OpenAI | ElevenLabs | Azure |
|------|----------|--------|------------|-------|
| 停顿 | [pause:1] | (无) | `<break time="1s"/>` | `<break time="1s"/>` |
| 强调 | [emphasis] | (无) | `<emphasis>` | `<emphasis>` |
| 语速 | [speed:slow] | (无) | (参数控制) | `<prosody rate="slow">` |

### 转换函数示例

```python
def convert_to_ssml(text: str, provider: str) -> str:
    """将通用标记转换为特定 TTS 平台的 SSML"""

    if provider == "azure":
        # [pause:1] -> <break time="1s"/>
        text = re.sub(
            r'\[pause:([\d.]+)\]',
            r'<break time="\1s"/>',
            text
        )
        # [emphasis]xxx[/emphasis] -> <emphasis>xxx</emphasis>
        text = re.sub(
            r'\[emphasis\](.*?)\[/emphasis\]',
            r'<emphasis>\1</emphasis>',
            text
        )

    elif provider == "elevenlabs":
        # ElevenLabs 使用不同的格式
        text = re.sub(
            r'\[pause:([\d.]+)\]',
            r'<break time="\1s"/>',
            text
        )

    elif provider == "openai":
        # OpenAI TTS 不支持 SSML，移除标记
        text = re.sub(r'\[pause:[\d.]+\]', ' ', text)
        text = re.sub(r'\[/?emphasis\]', '', text)

    return text
````

---

## 五、质量控制

### 5.1 脚本检查项

```python
def validate_script(script: list) -> dict:
    """验证脚本质量"""

    issues = []

    # 1. 检查对话平衡
    host_chars = sum(len(s['text']) for s in script if s['role'] == 'host')
    guest_chars = sum(len(s['text']) for s in script if s['role'] == 'guest')
    ratio = host_chars / guest_chars if guest_chars > 0 else 999

    if ratio < 0.5 or ratio > 2.0:
        issues.append("对话不平衡：Host/Guest 比例应在 0.5-2.0 之间")

    # 2. 检查单句长度
    for s in script:
        if len(s['text']) > 200:
            issues.append(f"单句过长：{s['text'][:50]}...")

    # 3. 检查连续同角色
    prev_role = None
    consecutive = 0
    for s in script:
        if s['role'] == prev_role:
            consecutive += 1
            if consecutive >= 3:
                issues.append("连续3句以上同角色，需要增加互动")
        else:
            consecutive = 1
        prev_role = s['role']

    # 4. 检查开场和结尾
    if not any(kw in script[0]['text'] for kw in ['大家好', '欢迎', '你好']):
        issues.append("缺少开场问候")

    if not any(kw in script[-1]['text'] for kw in ['感谢', '再见', '下期']):
        issues.append("缺少结尾告别")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "stats": {
            "total_chars": host_chars + guest_chars,
            "host_ratio": host_chars / (host_chars + guest_chars),
            "turns": len(script)
        }
    }
```

### 5.2 常见问题处理

| 问题         | 检测方法     | 处理方案           |
| ------------ | ------------ | ------------------ |
| 对话太生硬   | 缺少语气词   | 自动添加"嗯"、"对" |
| 句子太长     | 字符数 > 100 | 自动断句           |
| 信息密度太高 | 专业词汇密度 | 添加解释和例子     |
| 缺少互动     | 连续同角色   | 插入回应和提问     |

---

## 六、Token 成本估算

### 输入 Token 估算

| 步骤     | 输入内容             | 估算 Token     |
| -------- | -------------------- | -------------- |
| 内容分析 | 原文 + Prompt        | 2000-5000      |
| 框架生成 | 分析结果 + Prompt    | 1000-2000      |
| 脚本生成 | 框架 + 原文 + Prompt | 3000-6000      |
| 脚本优化 | 脚本 + Prompt        | 2000-4000      |
| **总计** |                      | **8000-17000** |

### 输出 Token 估算

| 步骤     | 输出内容   | 估算 Token     |
| -------- | ---------- | -------------- |
| 内容分析 | JSON 结构  | 200-500        |
| 框架生成 | 大纲 JSON  | 500-1000       |
| 脚本生成 | 完整对话   | 2000-5000      |
| 脚本优化 | 优化后脚本 | 2500-5500      |
| **总计** |            | **5000-12000** |

### 成本估算 (GPT-4)

```
10分钟播客 ≈ 15000 input tokens + 8000 output tokens
成本 ≈ $0.015 * 15 + $0.06 * 8 = $0.225 + $0.48 = $0.705

使用 GPT-4-Turbo:
成本 ≈ $0.01 * 15 + $0.03 * 8 = $0.15 + $0.24 = $0.39
```

---

## 七、示例输出

### 输入

```
话题：AI 对程序员工作的影响
时长：5分钟
风格：轻松聊天
```

### 生成的脚本（片段）

```json
[
  {
    "role": "host",
    "text": "大家好！欢迎收听今天的节目。我是主持人小明。",
    "emotion": "excited"
  },
  {
    "role": "guest",
    "text": "大家好，我是小红，很高兴今天能来聊这个话题。",
    "emotion": "friendly"
  },
  {
    "role": "host",
    "text": "今天我们要聊的是，AI 对程序员工作的影响。小红你平时工作中用 AI 工具吗？",
    "emotion": "curious"
  },
  {
    "role": "guest",
    "text": "用啊，天天用！[pause:0.5] 说实话，现在写代码不用 AI 助手，感觉效率差了一大截。",
    "emotion": "enthusiastic"
  },
  {
    "role": "host",
    "text": "哇，这么依赖了吗？[笑] 那你觉得 AI 会取代程序员吗？",
    "emotion": "surprised"
  },
  {
    "role": "guest",
    "text": "这个问题嘛...[pause:1] 我觉得短期内不会。AI 更像是一个超级助手，帮你做重复性工作。但核心的架构设计、需求理解，还是得人来。",
    "emotion": "thoughtful"
  }
]
```

---

_文档持续更新中..._
