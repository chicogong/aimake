# AudioCard Component Specification

## Overview

The AudioCard is a visual representation of generated TTS audio with interactive playback controls and real-time waveform visualization.

## Features

### Core Features
1. **Audio Playback**
   - Play/Pause toggle
   - Seek by clicking on waveform
   - Current time / total duration display
   - Volume control

2. **Waveform Visualization**
   - Real-time rendering during generation
   - Visual feedback during playback
   - Click-to-seek interaction
   - Hover preview

3. **Metadata Display**
   - Generation time (ms)
   - File size
   - Audio format (MP3/WAV)
   - RTF (Real-Time Factor)

4. **Actions**
   - Download audio file
   - Regenerate with new settings
   - Copy shareable link
   - Delete card

5. **States**
   - Loading (generating audio)
   - Ready (audio available)
   - Playing (actively playing)
   - Error (generation failed)

## Visual Design

```
┌─────────────────────────────────────┐
│ 🎵 Audio Result              [●][×] │ ← Header with actions
│ 5.2s · 542ms · 128 KB              │ ← Metadata
├─────────────────────────────────────┤
│                                     │
│  [▶]  ━━━━━━━○━━━━━━━━━━━━   🔊   │ ← Playback controls
│       0:02 / 0:05                   │
│                                     │
├─────────────────────────────────────┤
│ [Waveform Canvas]                   │ ← Waveform visualization
│  ╱╲  ╱╲╱╲    ╱╲  ╱╲  ╱╲╱╲╱╲       │   (click to seek)
│                                     │
├─────────────────────────────────────┤
│ From: "Tesla Cybertruck uses..."    │ ← Source prompt
├─────────────────────────────────────┤
│ [💾 Download] [🔄 Regenerate]       │ ← Action buttons
└─────────────────────────────────────┘
```

## Component Props

```typescript
interface AudioCardProps {
  card: AudioCard;
  selected?: boolean;
  onUpdate?: (id: string, updates: Partial<AudioCard>) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  onRegenerate?: (promptId: string) => void;
  isDragging?: boolean;
}
```

## Data Structure

```typescript
interface AudioCard {
  id: string;
  type: 'audio';
  position: { x: number; y: number };
  status: 'loading' | 'ready' | 'playing' | 'error';
  content: {
    audioUrl: string;
    duration: number; // seconds
    waveform: number[]; // Amplitude data (0-1)
    format: 'mp3' | 'wav';
    fileSize: number; // bytes
  };
  metadata: {
    generationTime: number; // ms
    rtf: number; // Real-Time Factor
    promptId: string; // Link to source prompt
    promptText: string; // Preview of source text
  };
  createdAt: Date;
}
```

## Waveform Algorithm

### Data Structure
```typescript
// Waveform data: array of amplitudes (0-1)
// Example: [0.2, 0.5, 0.8, 0.6, 0.3, ...]
// Length: 100-200 samples for good visual density
```

### Rendering Strategy
1. **Canvas-based**: Use HTML5 Canvas for performance
2. **Bar visualization**: Each sample = vertical bar
3. **Gradient fill**: Use color gradient for visual appeal
4. **Progress indicator**: Different color for played portion

### Performance Optimization
- Downsample audio data to 100-200 points
- Use requestAnimationFrame for smooth playback updates
- Memoize canvas rendering when not playing

## States & Interactions

### Loading State
```
┌─────────────────────────────────────┐
│ 🎵 Generating Audio...       [●][×] │
│ ⏳ Estimated: 542ms                 │
├─────────────────────────────────────┤
│ [Skeleton Animation]                │
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░         │
└─────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────┐
│ ❌ Generation Failed          [●][×]│
│ Network error. Please retry.        │
├─────────────────────────────────────┤
│ [🔄 Retry Generation]               │
└─────────────────────────────────────┘
```

### Hover State
```
Waveform cursor changes to pointer
Show time tooltip on hover
Card elevation increases (shadow)
```

### Selected State
```
Border: 2px solid #1A6BA0 (Sonic Blue)
Glow: 0 0 0 4px rgba(26, 107, 160, 0.2)
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| Left Arrow | Seek -5s |
| Right Arrow | Seek +5s |
| Up Arrow | Volume +10% |
| Down Arrow | Volume -10% |
| Delete | Delete card |

## Accessibility

- **ARIA labels**: All controls have descriptive labels
- **Keyboard navigation**: Full keyboard support
- **Screen reader**: Announces playback state
- **Focus indicators**: Visible focus rings

## Technical Implementation

### Key Technologies
- **Audio**: Web Audio API + HTMLAudioElement
- **Waveform**: Canvas API
- **State**: React hooks (useState, useRef, useEffect)
- **Animation**: requestAnimationFrame

### Performance Targets
- **Initial render**: < 50ms
- **Playback update**: 60 FPS
- **Waveform render**: < 16ms
- **Memory**: < 5MB per card

## Next Steps
1. Implement WaveformCanvas subcomponent
2. Implement AudioCard main component
3. Add unit tests
4. Create usage documentation
