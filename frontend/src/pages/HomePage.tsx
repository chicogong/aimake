/**
 * Home Page
 * Main TTS generation page
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Zap, Clock, Shield } from 'lucide-react';
import { TTSForm } from '@/components/tts/TTSForm';
import { AudioPlayer } from '@/components/tts/AudioPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { ttsApi, setupApiAuth, userApi } from '@/services/api';
import { useTTSStore } from '@/stores/ttsStore';
import { useUserStore } from '@/stores/userStore';
import { toastHelpers } from '@/hooks/useToast';

// Audio result type
interface AudioResult {
  url: string;
  duration: number;
  size: number;
}

export function HomePage() {
  const { getToken, isSignedIn } = useAuth();
  const [progress, setProgress] = useState(0);
  const [generatedAudio, setGeneratedAudio] = useState<AudioResult | null>(null);

  const { text, selectedVoice, speed, pitch, format, isGenerating, setIsGenerating } =
    useTTSStore();
  const { setUser, updateQuota } = useUserStore();

  // Setup API auth
  useEffect(() => {
    if (isSignedIn) {
      setupApiAuth(getToken);

      // Fetch user data
      userApi.getMe().then((res: any) => {
        if (res?.data) {
          setUser(res.data);
        }
      });
    }
  }, [isSignedIn, getToken, setUser]);

  // Generate mutation - using sync API
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVoice) throw new Error('请选择音色');

      setProgress(30);

      // Use sync API - returns audio blob directly
      const blob = await ttsApi.generateSync({
        text,
        voiceId: selectedVoice.id,
        speed,
        pitch,
        format,
      });

      setProgress(90);

      // Create object URL from blob
      const audioUrl = URL.createObjectURL(blob);
      
      // Estimate duration based on text length
      const estimatedDuration = Math.ceil(text.length / 150);

      return {
        url: audioUrl,
        duration: estimatedDuration,
        size: blob.size,
      };
    },
    onMutate: () => {
      setIsGenerating(true);
      setProgress(10);
      // Revoke previous audio URL if exists
      if (generatedAudio?.url) {
        URL.revokeObjectURL(generatedAudio.url);
      }
      setGeneratedAudio(null);
    },
    onSuccess: (result) => {
      setGeneratedAudio(result);
      setProgress(100);
      toastHelpers.success('生成成功！', '音频已准备就绪');

      // Update quota
      if (result.duration) {
        updateQuota({
          used: Math.ceil(result.duration),
        });
      }
    },
    onError: (error: any) => {
      toastHelpers.error('生成失败', error.message || '请稍后重试');
      setProgress(0);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleDownload = () => {
    if (generatedAudio?.url) {
      const link = document.createElement('a');
      link.href = generatedAudio.url;
      link.download = `aimake-${Date.now()}.${format}`;
      link.click();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          AI 驱动的语音生成
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          文字转语音
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          输入任意文本，选择你喜欢的音色，几秒内生成自然流畅的语音
        </p>
      </div>

      {/* Features badges */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {[
          { icon: Zap, label: '快速生成', desc: '秒级响应' },
          { icon: Clock, label: '免费额度', desc: '每月10分钟' },
          { icon: Shield, label: '安全可靠', desc: '数据加密' },
        ].map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border"
          >
            <Icon className="h-4 w-4 text-primary" />
            <div className="text-sm">
              <span className="font-medium">{label}</span>
              <span className="text-muted-foreground ml-1">· {desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main form */}
      <TTSForm
        onGenerate={() => generateMutation.mutate()}
        isGenerating={isGenerating}
        progress={progress}
      />

      {/* Generated audio player */}
      {generatedAudio && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">生成结果</h3>
          <AudioPlayer
            audioUrl={generatedAudio.url}
            title={text.substring(0, 50)}
            duration={generatedAudio.duration}
            fileSize={generatedAudio.size}
            onDownload={handleDownload}
          />
        </div>
      )}

      {/* Tips section */}
      <Card className="mt-12 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">使用技巧</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              文本中的标点符号会影响语音的停顿和节奏
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              适当调整语速可以让语音听起来更自然
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              不同音色适合不同场景，新闻适合专业音色，故事适合温柔音色
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              MP3 格式文件更小，WAV 格式音质更好
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
