# AudioCard Component - Usage Guide

## Overview

The `AudioCard` component displays generated TTS audio with interactive playback controls, real-time waveform visualization, and comprehensive metadata display.

## Features

### ✨ Core Capabilities

1. **Audio Playback**
   - Play/Pause toggle with keyboard shortcuts
   - Click-to-seek on waveform
   - Volume control with mute toggle
   - Current time / total duration display

2. **Waveform Visualization**
   - Real-time Canvas-based rendering
   - Visual progress indicator
   - Hover-to-preview time tooltip
   - Smooth animations during playback

3. **Performance Metrics**
   - Generation time (ms)
   - Real-Time Factor (RTF)
   - File size and format
   - Audio duration

4. **Actions**
   - Download audio file (MP3/WAV)
   - Regenerate with new settings
   - Copy shareable link
   - Delete card

5. **Keyboard Shortcuts**
   - `Space`: Play/Pause
   - `←`/`→`: Seek ±5 seconds
   - `↑`/`↓`: Volume ±10%
   - `Delete`: Remove card

## Installation

```bash
# Install dependencies
npm install react clsx

# Or with yarn
yarn add react clsx
```

## Basic Usage

```tsx
import { AudioCard } from './components/canvas/AudioCard';
import type { AudioCard as AudioCardType } from './types/card';

// Example audio card data
const audioCard: AudioCardType = {
  id: 'audio-1',
  type: 'audio',
  position: { x: 100, y: 100 },
  size: { width: 320, height: 280 },
  content: {
    audioUrl: 'https://example.com/audio.mp3',
    duration: 5.2, // seconds
    waveform: [0.2, 0.5, 0.8, 0.6, 0.3, ...], // 100-200 samples
    format: 'mp3',
    fileSize: 131072, // bytes
  },
  metadata: {
    generationTime: 542, // ms
    rtf: 0.104,
    promptId: 'prompt-1',
    promptText: 'Tesla Cybertruck uses Kubernetes...',
  },
  status: 'ready',
  selected: false,
  zIndex: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function MyCanvas() {
  return (
    <AudioCard
      card={audioCard}
      selected={false}
      onDelete={(id) => console.log('Delete', id)}
      onSelect={(id) => console.log('Select', id)}
      onRegenerate={(promptId) => console.log('Regenerate', promptId)}
    />
  );
}
```

## Props

### AudioCardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `card` | `AudioCardType` | ✅ | Audio card data |
| `selected` | `boolean` | ❌ | Whether card is selected (default: `false`) |
| `isDragging` | `boolean` | ❌ | Whether card is being dragged (default: `false`) |
| `onUpdate` | `(id: string, updates: Partial<AudioCardType>) => void` | ❌ | Called when card is updated |
| `onDelete` | `(id: string) => void` | ❌ | Called when delete is clicked |
| `onSelect` | `(id: string) => void` | ❌ | Called when card is clicked |
| `onRegenerate` | `(promptId: string) => void` | ❌ | Called when regenerate is clicked |

### AudioCard Type

```typescript
interface AudioCard {
  id: string;
  type: 'audio';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: {
    audioUrl: string;           // URL to audio file
    duration: number;            // Total duration in seconds
    waveform: number[];          // Amplitude data (0-1)
    format: 'mp3' | 'wav';      // Audio format
    fileSize: number;            // File size in bytes
  };
  metadata: {
    generationTime: number;      // Inference time in ms
    rtf: number;                 // Real-Time Factor
    promptId: string;            // Source prompt card ID
    promptText: string;          // Preview of source text
  };
  status: 'loading' | 'ready' | 'playing' | 'error';
  selected: boolean;
  zIndex: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Examples

### Example 1: With State Management

```tsx
import { useState } from 'react';
import { AudioCard } from './components/canvas/AudioCard';

function CanvasWithAudio() {
  const [cards, setCards] = useState<AudioCardType[]>([audioCard]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleRegenerate = async (promptId: string) => {
    // Call API to regenerate audio
    const newAudio = await regenerateAudio(promptId);
    // Update card with new audio
    setCards(prev => prev.map(card =>
      card.id === selectedId ? { ...card, ...newAudio } : card
    ));
  };

  return (
    <div className="canvas">
      {cards.map(card => (
        <AudioCard
          key={card.id}
          card={card}
          selected={card.id === selectedId}
          onDelete={handleDelete}
          onSelect={handleSelect}
          onRegenerate={handleRegenerate}
        />
      ))}
    </div>
  );
}
```

### Example 2: Loading State

```tsx
const loadingCard: AudioCardType = {
  ...audioCard,
  status: 'loading',
  content: {
    ...audioCard.content,
    waveform: [], // Empty waveform shows skeleton
  },
};

<AudioCard card={loadingCard} />
```

### Example 3: Error State

```tsx
const errorCard: AudioCardType = {
  ...audioCard,
  status: 'error',
};

<AudioCard
  card={errorCard}
  onRegenerate={(promptId) => retryGeneration(promptId)}
/>
```

### Example 4: Custom Styling

```tsx
// Add custom classes via className prop on WaveformCanvas
<AudioCard
  card={audioCard}
  className="shadow-2xl border-4 border-primary"
/>
```

## Waveform Data

### Generating Waveform Data

The waveform prop expects an array of amplitude values between 0 and 1. Here's how to generate it:

```typescript
/**
 * Generate waveform data from audio file
 */
async function generateWaveform(audioUrl: string): Promise<number[]> {
  // Fetch audio file
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();

  // Decode audio
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Get channel data
  const channelData = audioBuffer.getChannelData(0); // Use first channel

  // Downsample to ~100-200 samples for visualization
  const samples = 150;
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    const end = start + blockSize;
    let sum = 0;

    // Calculate RMS (Root Mean Square) for this block
    for (let j = start; j < end; j++) {
      sum += channelData[j] * channelData[j];
    }
    const rms = Math.sqrt(sum / blockSize);

    // Normalize to 0-1 range
    waveform.push(Math.min(1, rms * 2));
  }

  return waveform;
}
```

### Backend Generation (Recommended)

For better performance, generate waveform data on the backend:

```python
# Python example using librosa
import librosa
import numpy as np

def generate_waveform(audio_path: str, num_samples: int = 150) -> list[float]:
    """Generate waveform data for visualization"""
    # Load audio
    y, sr = librosa.load(audio_path, sr=None)

    # Downsample
    block_size = len(y) // num_samples
    waveform = []

    for i in range(num_samples):
        start = i * block_size
        end = start + block_size
        block = y[start:end]

        # Calculate RMS
        rms = np.sqrt(np.mean(block ** 2))

        # Normalize to 0-1
        waveform.append(min(1.0, rms * 2))

    return waveform
```

## Keyboard Shortcuts

When a card is selected, these shortcuts are active:

| Shortcut | Action |
|----------|--------|
| **Space** | Toggle play/pause |
| **←** (Left Arrow) | Seek backward 5 seconds |
| **→** (Right Arrow) | Seek forward 5 seconds |
| **↑** (Up Arrow) | Increase volume by 10% |
| **↓** (Down Arrow) | Decrease volume by 10% |
| **Delete** / **Backspace** | Delete card (calls `onDelete`) |

## Styling

### Tailwind Configuration

Add these to your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6BA0',
          light: '#2D88C4',
          dark: '#145783',
        },
        accent: {
          DEFAULT: '#E85D00',
          light: '#FF7C2E',
          dark: '#C44F00',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
};
```

### Custom Colors

To use different colors, override the Tailwind classes:

```tsx
// Create a custom variant
const customAudioCard = clsx(
  'border-blue-500',    // Different border
  'shadow-blue-500/30', // Different shadow
);
```

## Performance Optimization

### 1. Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const AudioCard = lazy(() => import('./components/canvas/AudioCard'));

<Suspense fallback={<LoadingSkeleton />}>
  <AudioCard card={audioCard} />
</Suspense>
```

### 2. Memoization

```tsx
import { memo } from 'react';

const MemoizedAudioCard = memo(AudioCard, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.card.id === nextProps.card.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.card.status === nextProps.card.status
  );
});
```

### 3. Virtualization

For canvases with many audio cards, use windowing:

```tsx
import { FixedSizeGrid } from 'react-window';

<FixedSizeGrid
  columnCount={3}
  rowCount={Math.ceil(audioCards.length / 3)}
  columnWidth={340}
  rowHeight={300}
  height={600}
  width={1040}
>
  {({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 3 + columnIndex;
    const card = audioCards[index];
    return card ? (
      <div style={style}>
        <AudioCard card={card} />
      </div>
    ) : null;
  }}
</FixedSizeGrid>
```

## Accessibility

### ARIA Labels

The component includes comprehensive ARIA labels:

```tsx
<div role="article" aria-label="Audio card">
  <button aria-label="Play">...</button>
  <div role="slider" aria-label="Audio waveform">...</div>
</div>
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are visible
- Tab order follows logical flow

### Screen Readers

Screen readers will announce:
- Playback state changes
- Current time updates
- Volume changes
- Status messages

## Troubleshooting

### Audio Not Playing

```tsx
// Ensure audioUrl is accessible
const card = {
  ...audioCard,
  content: {
    ...audioCard.content,
    audioUrl: 'https://cors-enabled-url.com/audio.mp3',
  },
};
```

### Waveform Not Showing

```tsx
// Ensure waveform has data
if (card.content.waveform.length === 0) {
  // Generate waveform data
  const waveform = await generateWaveform(card.content.audioUrl);
  updateCard({ ...card, content: { ...card.content, waveform } });
}
```

### Performance Issues

```tsx
// Use React.memo
const OptimizedAudioCard = memo(AudioCard);

// Limit concurrent playing cards
const [playingId, setPlayingId] = useState<string | null>(null);

<AudioCard
  card={card}
  onPlay={() => {
    // Pause other cards
    if (playingId && playingId !== card.id) {
      pauseCard(playingId);
    }
    setPlayingId(card.id);
  }}
/>
```

## Related Components

- **WaveformCanvas**: Standalone waveform visualization
- **PromptCard**: Create prompts that generate audio
- **CompareCard**: A/B test different audio versions

## API Reference

See [audiocard-spec.md](./audiocard-spec.md) for complete technical specifications.

## Examples Repository

Find more examples in:
- `/examples/audio-card-basic.tsx`
- `/examples/audio-card-with-state.tsx`
- `/examples/audio-card-custom-theme.tsx`

## Support

For issues or questions:
- GitHub: [aimake.cc/issues](https://github.com/yourusername/aimake/issues)
- Discord: [aimake.cc/discord](https://discord.gg/aimake)

---

**Built with ❤️ for aimake.cc** | Version 1.0.0 | Last Updated: 2026-01-08
