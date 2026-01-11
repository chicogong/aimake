/**
 * TTS Form Component
 * Main text-to-speech input form
 */

import { useState } from 'react';
import { Mic, Wand2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { VoiceSelector } from './VoiceSelector';
import { useTTSStore } from '@/stores/ttsStore';
import { cn } from '@/lib/utils';

interface TTSFormProps {
  onGenerate: () => void;
  isGenerating: boolean;
  progress: number;
}

export function TTSForm({ onGenerate, isGenerating, progress }: TTSFormProps) {
  const [showSettings, setShowSettings] = useState(false);
  const {
    text,
    setText,
    selectedVoice,
    setVoice,
    speed,
    setSpeed,
    pitch,
    setPitch,
    format,
    setFormat,
  } = useTTSStore();

  const charCount = text.length;
  const maxChars = 5000;
  const isOverLimit = charCount > maxChars;

  const canGenerate = text.trim().length > 0 && selectedVoice && !isOverLimit && !isGenerating;

  return (
    <div className="space-y-6">
      {/* Text Input Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              输入文本
            </CardTitle>
            <div
              className={cn(
                'text-sm',
                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {charCount} / {maxChars}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要转换成语音的文本..."
            className="min-h-[200px] text-base leading-relaxed"
            disabled={isGenerating}
            error={isOverLimit ? '文本长度超出限制' : undefined}
          />

          {/* Quick templates */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">快速填充：</span>
            {[
              '你好，欢迎使用 AIMake，我是你的 AI 语音助手。',
              '今天的天气非常好，适合出门散步。',
              '让我们一起探索 AI 语音技术的无限可能。',
            ].map((template, i) => (
              <button
                key={i}
                onClick={() => setText(template)}
                className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                disabled={isGenerating}
              >
                示例 {i + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Selection Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            选择音色
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VoiceSelector
            selectedVoice={selectedVoice}
            onSelect={setVoice}
            disabled={isGenerating}
          />
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              高级设置
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              {showSettings ? '收起' : '展开'}
            </span>
          </button>
        </CardHeader>
        {showSettings && (
          <CardContent className="space-y-6">
            {/* Speed control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">语速</label>
                <span className="text-sm text-muted-foreground">{speed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={([v]) => setSpeed(v)}
                min={0.5}
                max={2.0}
                step={0.1}
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>慢 (0.5x)</span>
                <span>正常</span>
                <span>快 (2.0x)</span>
              </div>
            </div>

            {/* Pitch control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">音调</label>
                <span className="text-sm text-muted-foreground">{pitch > 0 ? '+' : ''}{pitch}</span>
              </div>
              <Slider
                value={[pitch]}
                onValueChange={([v]) => setPitch(v)}
                min={-10}
                max={10}
                step={1}
                disabled={isGenerating}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>低沉</span>
                <span>正常</span>
                <span>尖锐</span>
              </div>
            </div>

            {/* Format selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">输出格式</label>
              <div className="flex gap-3">
                {(['mp3', 'wav'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    disabled={isGenerating}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                      format === fmt
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    {fmt.toUpperCase()}
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {fmt === 'mp3' ? '较小体积' : '无损音质'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Generate Button */}
      <div className="space-y-4">
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">正在生成...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <Button
          onClick={onGenerate}
          disabled={!canGenerate}
          loading={isGenerating}
          variant="gradient"
          size="xl"
          className="w-full"
        >
          {isGenerating ? '生成中...' : '生成语音'}
        </Button>

        {!selectedVoice && text.trim() && (
          <p className="text-center text-sm text-muted-foreground">请选择一个音色</p>
        )}
      </div>
    </div>
  );
}
