/**
 * Voice Selector Component
 * Displays available voices for TTS
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Check, Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { voicesApi } from '@/services/api';
import type { Voice } from '@/types';

interface VoiceSelectorProps {
  selectedVoice: Voice | null;
  onSelect: (voice: Voice) => void;
  disabled?: boolean;
}

export function VoiceSelector({ selectedVoice, onSelect, disabled }: VoiceSelectorProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['voices'],
    queryFn: () => voicesApi.list(),
  });

  const voices = (data as { data: Voice[] })?.data || [];

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const handlePlayPreview = async (voice: Voice, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!voice.previewUrl) return;

    // Stop current audio if playing
    if (audio) {
      audio.pause();
      audio.src = '';
    }

    // If clicking the same voice, just stop
    if (playingId === voice.id) {
      setPlayingId(null);
      return;
    }

    // Play new audio
    const newAudio = new Audio(voice.previewUrl);
    setAudio(newAudio);
    setPlayingId(voice.id);

    newAudio.onended = () => setPlayingId(null);
    newAudio.onerror = () => setPlayingId(null);

    try {
      await newAudio.play();
    } catch {
      setPlayingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>加载音色失败，请刷新页面重试</p>
      </div>
    );
  }

  // Group voices by provider
  const groupedVoices = voices.reduce(
    (acc, voice) => {
      const provider = voice.provider;
      if (!acc[provider]) acc[provider] = [];
      acc[provider].push(voice);
      return acc;
    },
    {} as Record<string, Voice[]>
  );

  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    tencent: '腾讯云',
    elevenlabs: 'ElevenLabs',
    azure: 'Azure',
    minimax: 'MiniMax',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedVoices).map(([provider, providerVoices]) => (
        <div key={provider}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {providerNames[provider] || provider}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {providerVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => onSelect(voice)}
                disabled={disabled}
                className={cn(
                  'relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  'hover:border-primary/50 hover:bg-primary/5',
                  selectedVoice?.id === voice.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {/* Selected check */}
                {selectedVoice?.id === voice.id && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}

                {/* Premium badge */}
                {voice.isPremium && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    <Crown className="h-3 w-3" />
                    Pro
                  </div>
                )}

                {/* Voice info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">
                    {voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🤖'}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{voice.nameZh || voice.name}</p>
                    <p className="text-xs text-muted-foreground">{voice.name}</p>
                  </div>
                </div>

                {/* Style tag */}
                {voice.style && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded mb-2">
                    {voice.style}
                  </span>
                )}

                {/* Preview button */}
                {voice.previewUrl && (
                  <button
                    onClick={(e) => handlePlayPreview(voice, e)}
                    className={cn(
                      'mt-auto flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors',
                      playingId === voice.id && 'text-green-600'
                    )}
                  >
                    {playingId === voice.id ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        播放中...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        试听
                      </>
                    )}
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
