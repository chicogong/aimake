/**
 * WaveformCanvas Component
 *
 * Renders an audio waveform visualization using Canvas API.
 * Supports click-to-seek and displays current playback progress.
 */

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface WaveformCanvasProps {
  /** Array of amplitude values (0-1) representing the waveform */
  waveform: number[];
  /** Current playback progress (0-1) */
  progress?: number;
  /** Duration of audio in seconds */
  duration: number;
  /** Whether audio is currently playing */
  isPlaying?: boolean;
  /** Callback when user clicks to seek */
  onSeek?: (time: number) => void;
  /** Height of canvas in pixels */
  height?: number;
  /** Additional CSS classes */
  className?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  waveform,
  progress = 0,
  duration,
  isPlaying = false,
  onSeek,
  height = 80,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  // Update canvas dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveform.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size (accounting for device pixel ratio)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate bar width and gap
    const barCount = waveform.length;
    const gap = 2;
    const barWidth = Math.max(2, (width - gap * (barCount - 1)) / barCount);

    const centerY = height / 2;
    const maxBarHeight = height * 0.8;

    // Draw each bar
    waveform.forEach((amplitude, index) => {
      const x = index * (barWidth + gap);
      const barHeight = amplitude * maxBarHeight;
      const y = centerY - barHeight / 2;

      // Determine color based on progress
      const barProgress = index / barCount;
      const isPlayed = barProgress <= progress;

      if (isPlayed) {
        // Played portion: Sonic Blue gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#2D88C4'); // primary-light
        gradient.addColorStop(1, '#1A6BA0'); // primary
        ctx.fillStyle = gradient;
      } else {
        // Unplayed portion: Gray
        ctx.fillStyle = '#CBD5E1'; // slate-300
      }

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      ctx.fill();
    });

    // Draw hover indicator
    if (hoverTime !== null) {
      const hoverX = (hoverTime / duration) * width;
      ctx.strokeStyle = '#E85D00'; // accent
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();
    }

    // Draw playback cursor (if playing)
    if (isPlaying && progress > 0) {
      const cursorX = progress * width;
      ctx.strokeStyle = '#1A6BA0'; // primary
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, height);
      ctx.stroke();

      // Pulse effect at cursor
      ctx.fillStyle = 'rgba(26, 107, 160, 0.3)';
      ctx.beginPath();
      ctx.arc(cursorX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [waveform, progress, dimensions, hoverTime, isPlaying, duration]);

  // Handle mouse move (hover preview)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = percentage * duration;
    setHoverTime(time);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  // Handle click (seek)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onSeek) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const time = Math.max(0, Math.min(duration, percentage * duration));
    onSeek(time);
  };

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={containerRef}
        className={clsx(
          'relative rounded-lg overflow-hidden',
          onSeek && 'cursor-pointer',
          'bg-slate-50 hover:bg-slate-100 transition-colors'
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="slider"
        aria-label="Audio waveform"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={progress * duration}
        tabIndex={0}
      >
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: `${height}px` }}
        />

        {/* Hover time tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded pointer-events-none"
            style={{
              left: `${(hoverTime / duration) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Loading skeleton (shown when waveform is empty) */}
      {waveform.length === 0 && (
        <div
          className="absolute inset-0 bg-slate-200 rounded-lg overflow-hidden"
          style={{ height: `${height}px` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300 to-transparent animate-shimmer" />
        </div>
      )}
    </div>
  );
};

// Add shimmer animation to Tailwind config
// @keyframes shimmer {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// }
