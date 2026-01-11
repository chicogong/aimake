/**
 * Audio Player Component
 * Professional audio player for TTS output
 */

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn, formatDuration, formatFileSize } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  duration?: number;
  fileSize?: number;
  onDownload?: () => void;
}

export function AudioPlayer({
  audioUrl,
  title,
  duration: initialDuration,
  fileSize,
  onDownload,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-2xl p-6 border border-primary/20">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Title and info */}
      {(title || fileSize) && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            {title && <h4 className="font-medium text-sm truncate max-w-[200px]">{title}</h4>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {duration > 0 && <span>{formatDuration(duration)}</span>}
            {fileSize && (
              <>
                <span>•</span>
                <span>{formatFileSize(fileSize)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Waveform visualization (placeholder) */}
      <div className="relative h-16 mb-4 bg-muted/50 rounded-lg overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/30 to-purple-500/30 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-end gap-0.5 h-10">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 rounded-full transition-all duration-150',
                  i < (progress / 100) * 50 ? 'bg-primary' : 'bg-muted-foreground/30'
                )}
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Progress slider */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          onValueChange={handleSeek}
          max={duration || 100}
          step={0.1}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Volume */}
          <button onClick={toggleMute} className="p-2 hover:bg-muted rounded-lg transition-colors">
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Volume2 className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={handleVolumeChange}
              max={1}
              step={0.1}
            />
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={restart}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="重新开始"
          >
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => skipTime(-10)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="后退 10 秒"
          >
            <SkipBack className="h-5 w-5 text-muted-foreground" />
          </button>

          <Button
            onClick={togglePlay}
            size="icon"
            variant="gradient"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <button
            onClick={() => skipTime(10)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="前进 10 秒"
          >
            <SkipForward className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Download */}
        <Button variant="outline" size="sm" onClick={onDownload} className="gap-2">
          <Download className="h-4 w-4" />
          下载
        </Button>
      </div>
    </div>
  );
}
