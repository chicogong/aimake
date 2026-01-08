/**
 * AudioCard Component
 *
 * Displays generated TTS audio with playback controls, waveform visualization,
 * and metadata. Supports play/pause, seek, download, and regeneration.
 */

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import type { AudioCard as AudioCardType } from '../../frontend-types/card';
import { WaveformCanvas } from './WaveformCanvas';
import { Button } from '../ui/Button';

interface AudioCardProps {
  /** Card data */
  card: AudioCardType;
  /** Whether card is selected */
  selected?: boolean;
  /** Whether card is being dragged */
  isDragging?: boolean;
  /** Called when card is updated */
  onUpdate?: (id: string, updates: Partial<AudioCardType>) => void;
  /** Called when card is deleted */
  onDelete?: (id: string) => void;
  /** Called when card is selected */
  onSelect?: (id: string) => void;
  /** Called when regenerate is requested */
  onRegenerate?: (promptId: string) => void;
}

export const AudioCard: React.FC<AudioCardProps> = ({
  card,
  selected = false,
  isDragging = false,
  onUpdate,
  onDelete,
  onSelect,
  onRegenerate,
}) => {
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const {
    content: { audioUrl, duration, waveform, format, fileSize },
    metadata: { generationTime, rtf, promptText },
    status = 'ready',
  } = card;

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;
    audio.volume = volume;

    // Update current time during playback
    const updateTime = () => {
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioUrl, volume]);

  // Play/Pause toggle
  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Playback failed:', error);
      });
    }
  };

  // Seek to specific time
  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  };

  // Volume control
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Download audio file
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `aimake-audio-${card.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy share link
  const handleCopyLink = () => {
    // In production, this would generate a proper share URL
    const shareUrl = `${window.location.origin}/audio/${card.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      // Show success toast (implement toast notification)
      console.log('Link copied to clipboard');
    });
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayback();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => Math.max(0, v - 0.1));
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          onDelete?.(card.id);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, isPlaying, currentTime, duration, card.id, onDelete]);

  // Card click handler
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, input')) {
      return;
    }
    onSelect?.(card.id);
  };

  return (
    <div
      className={clsx(
        'relative bg-white rounded-xl shadow-md transition-all duration-200',
        'border-2',
        selected
          ? 'border-primary shadow-primary/30 shadow-lg'
          : 'border-slate-200 hover:border-slate-300',
        isDragging && 'opacity-50 cursor-grabbing',
        !isDragging && 'cursor-default',
        'w-80 min-h-[280px]'
      )}
      onClick={handleCardClick}
      role="article"
      aria-label="Audio card"
      tabIndex={0}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="audio">
            🎵
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Audio Result</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{formatTime(duration)}</span>
              <span>·</span>
              <span className="text-primary font-medium">{generationTime}ms</span>
              <span>·</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopyLink}
            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
            aria-label="Copy link"
            title="Copy link"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete?.(card.id)}
            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
            aria-label="Delete card"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayback}
            className={clsx(
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all',
              'bg-primary hover:bg-primary-dark text-white',
              'shadow-md hover:shadow-lg',
              isPlaying && 'ring-4 ring-primary/20'
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {status === 'loading' ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Time Display */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
            {/* Simple progress bar (backup if waveform fails) */}
            <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* Volume Control */}
          <div
            className="relative flex-shrink-0"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              aria-label={volume > 0 ? 'Mute' : 'Unmute'}
            >
              {volume === 0 ? (
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>

            {/* Volume Slider */}
            {showVolumeSlider && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white rounded-lg shadow-lg border border-slate-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-primary"
                  aria-label="Volume"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="px-4 pb-3">
        <WaveformCanvas
          waveform={waveform}
          progress={currentTime / duration}
          duration={duration}
          isPlaying={isPlaying}
          onSeek={handleSeek}
          height={80}
        />
      </div>

      {/* Source Prompt Preview */}
      {promptText && (
        <div className="px-4 pb-3">
          <div className="text-xs text-slate-500 mb-1">From:</div>
          <div className="text-sm text-slate-700 line-clamp-2 bg-slate-50 rounded p-2 border border-slate-200">
            "{promptText}"
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          className="flex-1"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Download
        </Button>

        {onRegenerate && card.metadata?.promptId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRegenerate(card.metadata.promptId)}
            className="flex-1"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Regenerate
          </Button>
        )}
      </div>

      {/* Performance Badge */}
      {rtf && (
        <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
          RTF: {rtf.toFixed(3)}
        </div>
      )}

      {/* Loading Overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Generating Audio...</p>
            <p className="text-xs text-slate-500 mt-1">Estimated: {generationTime}ms</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-red-50/95 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-red-200">
          <div className="text-center px-4">
            <div className="text-4xl mb-2">❌</div>
            <p className="text-sm font-medium text-red-900 mb-1">Generation Failed</p>
            <p className="text-xs text-red-700 mb-4">Please try again</p>
            {onRegenerate && card.metadata?.promptId && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onRegenerate(card.metadata.promptId)}
              >
                Retry Generation
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
