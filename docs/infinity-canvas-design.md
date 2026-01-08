# Infinity Canvas Interface Design

## 🎨 Vision

**Infinity Canvas** 是 aimake.cc 的核心创新，将传统的线性 TTS 工作流转变为视觉化的创作空间。用户可以像在 Figma 或 Miro 中设计一样，在无限的画布上拖拽、组织和迭代音频内容。

### 核心理念
> "从对话式交互到空间化创作"

---

## 🏗️ Architecture Overview

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components + Konva Canvas)      │
├─────────────────────────────────────────┤
│         State Management Layer          │
│  (Zustand Store + Immer for Undo/Redo) │
├─────────────────────────────────────────┤
│         Data Persistence Layer          │
│  (PostgreSQL JSONB + Redis Cache)       │
└─────────────────────────────────────────┘
```

---

## 📐 Canvas Layout

### Main UI Structure

```
┌─────────────────────────────────────────────────────────┐
│  Top Toolbar (Fixed)                                    │
│  [Logo] [Canvas Name] [Share] [Undo] [Redo] [User]    │
├──────┬─────────────────────────────────────────┬────────┤
│      │                                         │        │
│  L   │                                         │    R   │
│  e   │         Infinite Canvas                 │    i   │
│  f   │      (Drag, Zoom, Pan)                  │    g   │
│  t   │                                         │    h   │
│      │   ┌──────────┐  ┌──────────┐           │    t   │
│  P   │   │ Prompt   │  │  Audio   │           │        │
│  a   │   │  Card    │  │  Card    │           │    I   │
│  n   │   └──────────┘  └──────────┘           │    n   │
│  e   │                                         │    s   │
│  l   │        ┌──────────┐                     │    p   │
│      │        │ Compare  │                     │    e   │
│      │        │  Card    │                     │    c   │
│      │        └──────────┘                     │    t   │
│      │                                         │    o   │
│      │                                         │    r   │
├──────┴─────────────────────────────────────────┴────────┤
│  Bottom Toolbar (Floating)                              │
│  [+ Add] [Zoom -] [100%] [Zoom +] [Fit] [Minimap]      │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 Core Components

### 1. Canvas Container

**Purpose**: Main workspace for creating and organizing content

**Features**:
- **Infinite scrolling** in all directions
- **Zoom levels**: 10% - 400%
- **Pan**: Click + drag on empty space
- **Grid snapping**: Optional (Cmd+G to toggle)
- **Multi-select**: Shift + Click or drag selection box

**Keyboard Shortcuts**:
| Action | Shortcut |
|--------|----------|
| Pan | Space + Drag |
| Zoom In | Cmd + "+" |
| Zoom Out | Cmd + "-" |
| Fit to Screen | Cmd + 0 |
| Reset Zoom | Cmd + 1 |

---

### 2. Card Types

#### a) Prompt Card (Input)

**Visual Design**:
```
┌─────────────────────────────┐
│ 📝 Prompt Card              │ ← Header
├─────────────────────────────┤
│                             │
│  Enter your text here...    │ ← Text Input Area
│  Tesla Cybertruck uses      │
│  Kubernetes in the cloud.   │
│                             │
├─────────────────────────────┤
│ ⚙️ Settings                  │ ← Footer
│ [Voice: EN-US] [Speed: 1.0] │
│ [🎙️ Generate]               │ ← Action Button
└─────────────────────────────┘
```

**Dimensions**: 320px × 240px (min), resizable

**States**:
- **Idle**: Gray border
- **Editing**: Purple border (focus)
- **Generating**: Pulsing border animation
- **Error**: Red border

**Interactions**:
- Double-click to edit text
- Click "Generate" → Creates linked Audio Card
- Drag corner to resize
- Right-click → Context menu (Copy, Delete, Duplicate)

**Data Structure**:
```typescript
interface PromptCard {
  id: string;
  type: 'prompt';
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: {
    text: string;
    voice: string;
    speed: number;
    pitch: number;
  };
  linkedAudio: string[]; // IDs of generated audio cards
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### b) Audio Card (Output)

**Visual Design**:
```
┌─────────────────────────────┐
│ 🎵 Audio Result             │
│ Duration: 5.2s | 542ms      │ ← Metadata
├─────────────────────────────┤
│ ▶️ ━━━━━━━○────────         │ ← Playback Controls
│ 0:02 / 0:05                 │
├─────────────────────────────┤
│ [Waveform Visualization]    │ ← Visual Feedback
│  ╱╲  ╱╲╱╲    ╱╲  ╱╲        │
├─────────────────────────────┤
│ 💾 Download | 🔄 Regenerate  │ ← Actions
└─────────────────────────────┘
```

**Dimensions**: 320px × 200px (fixed)

**States**:
- **Loading**: Skeleton animation
- **Ready**: Green border
- **Playing**: Animated waveform
- **Error**: Red border with error message

**Interactions**:
- Click ▶️ to play/pause
- Drag playhead to scrub
- Click "Download" → Save as MP3/WAV
- Click "Regenerate" → Update with new settings
- Hover → Show detailed stats (RTF, file size)

**Data Structure**:
```typescript
interface AudioCard {
  id: string;
  type: 'audio';
  position: { x: number; y: number };
  content: {
    audioUrl: string;
    duration: number;
    waveform: number[]; // Amplitude data for visualization
    format: 'mp3' | 'wav';
    fileSize: number;
  };
  metadata: {
    generationTime: number; // ms
    rtf: number; // Real-Time Factor
    promptId: string; // Link back to prompt
  };
  createdAt: Date;
}
```

---

#### c) Compare Card (A/B Testing)

**Visual Design**:
```
┌─────────────────────────────┐
│ 🔀 Compare: Voice A vs B    │
├──────────────┬──────────────┤
│   Version A  │  Version B   │
│ ┌──────────┐ │ ┌──────────┐│
│ │ [Audio]  │ │ │ [Audio]  ││
│ │ 🎵 542ms │ │ │ 🎵 680ms ││
│ └──────────┘ │ └──────────┘│
│              │              │
│   ⭐⭐⭐⭐⭐   │   ⭐⭐⭐⭐☆   │ ← User Rating
├──────────────┴──────────────┤
│ [Select Version A as Final]  │
└─────────────────────────────┘
```

**Purpose**: Side-by-side comparison of different TTS settings

**Features**:
- Play both audios simultaneously or sequentially
- Star rating system (1-5 stars)
- Visual diff highlighting (waveform overlay)
- Export winner to project

**Data Structure**:
```typescript
interface CompareCard {
  id: string;
  type: 'compare';
  position: { x: number; y: number };
  content: {
    versionA: string; // Audio card ID
    versionB: string;
    ratings: {
      A: number; // 1-5
      B: number;
    };
    notes: string;
  };
  selectedWinner?: 'A' | 'B';
}
```

---

#### d) Note Card (Annotation)

**Visual Design**:
```
┌─────────────────────────────┐
│ 📌 Note                     │
├─────────────────────────────┤
│                             │
│  Remember to adjust         │
│  pronunciation for          │
│  "Kubernetes" →             │
│  ˌkuːbərˈnɛtiːz            │
│                             │
└─────────────────────────────┘
```

**Purpose**: Add context, reminders, or instructions

**Dimensions**: 240px × 160px (min), resizable

**Features**:
- Markdown support
- Color coding (yellow, blue, red, green)
- Pinnable to other cards
- Collapsible

---

#### e) Group Container

**Visual Design**:
```
┌��� Project Name ───────────────────┐
│                                   │
│  ┌────────┐  ┌────────┐          │
│  │ Card 1 │  │ Card 2 │          │
│  └────────┘  └────────┘          │
│                                   │
│  ┌────────┐                       │
│  │ Card 3 │                       │
│  └────────┘                       │
│                                   │
└───────────────────────────────────┘
```

**Purpose**: Organize related cards

**Features**:
- Dashed border (non-intrusive)
- Move group = move all contained cards
- Collapse/expand
- Color-coded labels

---

## 🎯 Interactions & Gestures

### Mouse/Trackpad

| Action | Gesture | Result |
|--------|---------|--------|
| **Select Card** | Click | Highlight card with purple border |
| **Multi-Select** | Cmd + Click | Add to selection |
| **Drag Card** | Click + Drag | Move card |
| **Pan Canvas** | Space + Drag | Move viewport |
| **Zoom** | Pinch / Scroll | Zoom in/out |
| **Connect Cards** | Drag from port | Create connection line |
| **Context Menu** | Right-click | Show actions menu |

### Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **New Prompt** | Cmd + N | Create prompt card at center |
| **Delete** | Delete / Backspace | Remove selected cards |
| **Duplicate** | Cmd + D | Copy selected cards |
| **Undo** | Cmd + Z | Undo last action |
| **Redo** | Cmd + Shift + Z | Redo last undone action |
| **Select All** | Cmd + A | Select all cards |
| **Group** | Cmd + G | Group selected cards |
| **Ungroup** | Cmd + Shift + G | Ungroup selection |
| **Search** | Cmd + F | Search cards by content |
| **Zoom In** | Cmd + "+" | Increase zoom |
| **Zoom Out** | Cmd + "-" | Decrease zoom |
| **Fit View** | Cmd + 0 | Fit all cards in view |
| **Save** | Cmd + S | Auto-save to cloud |

---

## 🎨 Visual Design System

### Card Styling

**Default Card**:
```css
background: white;
border: 2px solid #E2E8F0; /* gray-200 */
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
```

**Selected Card**:
```css
border: 2px solid #8B5CF6; /* primary purple */
box-shadow: 0 4px 16px rgba(139,92,246,0.3);
```

**Hover State**:
```css
box-shadow: 0 4px 12px rgba(0,0,0,0.12);
transform: translateY(-2px);
transition: all 0.2s ease;
```

### Connection Lines

**Visual**:
- Bezier curves between cards
- Arrow at destination
- Animated dashed line during generation

**Colors**:
- Prompt → Audio: Purple (#8B5CF6)
- Audio → Compare: Blue (#3B82F6)
- Note → Card: Gray (#9CA3AF)

**Interaction**:
- Click line to delete connection
- Hover shows tooltip with metadata

---

## 🧭 Navigation & Controls

### Top Toolbar

```
┌─────────────────────────────────────────────────────┐
│ [aimake.cc Logo] | [Canvas Name 📝] | [Share 🔗]    │
│                                                      │
│ [↶ Undo] [↷ Redo] | [💾 Saved 2s ago] | [User 👤]  │
└─────────────────────────────────────────────────────┘
```

**Components**:
1. **Canvas Name**: Click to edit, auto-saves
2. **Share Button**: Generate share link, set permissions
3. **Undo/Redo**: Shows # of available steps on hover
4. **Save Indicator**: Auto-saves every 5 seconds
5. **User Menu**: Account, settings, logout

---

### Left Panel (Tools)

```
┌──────┐
│  📝  │ ← Prompt Card
├──────┤
│  🎵  │ ← Audio Card (disabled, generated only)
├──────┤
│  🔀  │ ← Compare Card
├──────┤
│  📌  │ ← Note Card
├──────┤
│  📁  │ ← Group
├──────┤
│  ✋  │ ← Selection Tool (default)
└──────┘
```

**Behavior**:
- Click tool → Activate (purple highlight)
- Click canvas → Create card at that position
- ESC → Return to selection tool

---

### Right Panel (Inspector)

**Dynamic content based on selection**:

**When Prompt Card is selected**:
```
┌─────────────────────┐
│ Prompt Settings     │
├─────────────────────┤
│ Voice               │
│ [EN-US Neural ▼]    │
│                     │
│ Speed: [===○=] 1.0x │
│ Pitch: [==○==] 0    │
│                     │
│ Dictionary          │
│ [+ Add Entry]       │
│ Tesla → ˈtɛslə      │
│                     │
│ [🎙️ Generate Audio] │
└─────────────────────┘
```

**When Audio Card is selected**:
```
┌─────────────────────┐
│ Audio Properties    │
├─────────────────────┤
│ Duration: 5.2s      │
│ File Size: 128 KB   │
│ Format: MP3 (192kbps)│
│ Generation: 542ms   │
│ RTF: 0.104          │
│                     │
│ Actions             │
│ [💾 Download]       │
│ [🔄 Regenerate]     │
│ [📋 Copy Link]      │
│ [🗑️ Delete]         │
└─────────────────────┘
```

---

### Bottom Toolbar (Floating)

```
┌─────────────────────────────────────────────────────┐
│ [+ Add] [Zoom -] [100%] [Zoom +] [Fit] [🗺️ Minimap]│
└─────────────────────────────────────────────────────┘
```

**Minimap**:
- Shows entire canvas in thumbnail (200x150px)
- Current viewport highlighted
- Click to jump to location
- Drag viewport rectangle to pan

---

## 🔄 Workflow Examples

### Example 1: Basic TTS Generation

1. User clicks "📝" tool in left panel
2. Clicks canvas → Prompt Card appears
3. User types: "Hello, this is a test"
4. Clicks "🎙️ Generate"
5. Audio Card appears to the right, connected by purple line
6. Waveform animates as audio generates
7. User clicks ▶️ to play

### Example 2: A/B Testing Voices

1. User has two Audio Cards (different voices)
2. Clicks "🔀" tool in left panel
3. Clicks canvas → Compare Card appears
4. User drags audio cards into compare slots
5. Plays both, rates them
6. Clicks "Select Version A as Final"
7. Version A copied to project folder

### Example 3: Complex Project

1. User creates Group Container "Podcast Intro"
2. Adds 3 Prompt Cards inside:
   - Intro music
   - Host greeting
   - Sponsor message
3. Generates audio for all three
4. Adds Note Card: "Check pronunciation of sponsor name"
5. Adjusts pronunciation dictionary
6. Regenerates sponsor message
7. Downloads all 3 audio files
8. Groups another section "Main Content"

---

## 🎬 Animations

### Card Creation
```
Opacity: 0 → 1 (300ms ease-out)
Scale: 0.8 → 1 (300ms spring)
```

### Card Deletion
```
Opacity: 1 → 0 (200ms ease-in)
Scale: 1 → 0.8 (200ms ease-in)
```

### Audio Generation
```
Border: Pulsing purple glow (1s loop)
Waveform: Animates left-to-right
```

### Connection Line Drawing
```
Path: Animates from source to destination (500ms)
Dash: Animated dashes moving along line
```

---

## 📊 State Management

### Zustand Store Structure

```typescript
interface CanvasState {
  // Canvas viewport
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };

  // Cards
  cards: Record<string, Card>;
  selectedCards: string[];

  // Connections
  connections: Connection[];

  // History for undo/redo
  history: {
    past: CanvasState[];
    present: CanvasState;
    future: CanvasState[];
  };

  // Actions
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  selectCard: (id: string, multiSelect?: boolean) => void;
  moveCards: (ids: string[], delta: { x: number; y: number }) => void;
  undo: () => void;
  redo: () => void;
  zoomTo: (zoom: number) => void;
  panTo: (x: number, y: number) => void;
}
```

---

## 🚀 Performance Optimizations

### Rendering

1. **Virtualization**: Only render cards in viewport
2. **Lazy Loading**: Load audio waveforms on demand
3. **Memoization**: Use React.memo for card components
4. **Debouncing**: Debounce pan/zoom events (16ms)

### Data Management

1. **Incremental Saves**: Save only changed cards
2. **Compression**: Compress canvas state in localStorage
3. **Pagination**: Load canvas history in chunks
4. **Caching**: Cache audio files in IndexedDB

---

## 🧪 Testing Scenarios

### Unit Tests

- [ ] Card creation/deletion
- [ ] Undo/redo stack
- [ ] Zoom/pan calculations
- [ ] Connection line routing
- [ ] Multi-select logic

### Integration Tests

- [ ] Generate audio from prompt
- [ ] Play audio in Audio Card
- [ ] Save/load canvas state
- [ ] Share canvas link
- [ ] Collaborative editing (future)

### E2E Tests

- [ ] Create prompt → Generate → Play → Download
- [ ] A/B testing workflow
- [ ] Grouping and organization
- [ ] Keyboard shortcuts
- [ ] Mobile touch gestures

---

## 📱 Mobile Considerations

### Touch Gestures

| Gesture | Action |
|---------|--------|
| Tap | Select card |
| Long Press | Context menu |
| Pinch | Zoom |
| Two-finger drag | Pan |
| Double-tap | Zoom to fit |

### Mobile Layout

- Left panel → Bottom drawer
- Right inspector → Modal overlay
- Simplified toolbar with essential actions
- Larger touch targets (min 44x44px)

---

## 🔐 Collaboration Features (Future)

### Real-time Collaboration

- Live cursors showing other users
- Presence indicators
- Card locking while editing
- Activity feed in right panel
- @mentions in notes

### Permissions

- **Owner**: Full control
- **Editor**: Create, edit, delete cards
- **Commenter**: Add notes only
- **Viewer**: Read-only

---

## 📚 Component Library (React + Konva)

### Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "konva": "^9.2.0",
    "react-konva": "^18.2.10",
    "zustand": "^4.4.0",
    "immer": "^10.0.2",
    "uuid": "^9.0.0"
  }
}
```

### Component Hierarchy

```
<CanvasApp>
  <TopToolbar />
  <CanvasContainer>
    <LeftPanel />
    <InfiniteCanvas>
      <Stage>
        <Layer>
          {cards.map(card => {
            switch(card.type) {
              case 'prompt': return <PromptCard />
              case 'audio': return <AudioCard />
              case 'compare': return <CompareCard />
              case 'note': return <NoteCard />
            }
          })}
          <ConnectionLines />
        </Layer>
      </Stage>
    </InfiniteCanvas>
    <RightInspector />
  </CanvasContainer>
  <BottomToolbar />
</CanvasApp>
```

---

## 🎯 Success Metrics

### User Engagement

- **Cards Created**: Average per session
- **Audio Generated**: Total hours
- **Time in Canvas**: Session duration
- **Undo/Redo Usage**: Iteration frequency
- **Share Rate**: % of canvases shared

### Performance

- **Initial Load**: < 2s
- **Card Render**: < 50ms per card
- **Zoom/Pan FPS**: 60 FPS
- **Audio Generation**: < 800ms (P95)
- **Save Latency**: < 500ms

---

## 🚧 Future Enhancements

### Phase 2 Features

- [ ] **Templates**: Pre-built canvas layouts
- [ ] **Version Control**: Git-like branching
- [ ] **Export Options**: PDF, video timeline
- [ ] **AI Suggestions**: Auto-layout, voice recommendations
- [ ] **Plugins**: Custom card types

### Phase 3 Features

- [ ] **Voice Cloning**: Custom voices in canvas
- [ ] **Video Integration**: Sync audio with video clips
- [ ] **Advanced Editing**: Trim, merge, crossfade
- [ ] **Analytics**: Usage heatmaps, A/B test results
- [ ] **API Access**: Programmatic canvas manipulation

---

## 📖 Design References

The Infinity Canvas design draws inspiration from:

- **Figma**: Infinite canvas, component system, multiplayer
- **Miro**: Sticky notes, freeform creativity, collaboration
- **Notion**: Flexible blocks, drag-and-drop, databases
- **Excalidraw**: Simplicity, hand-drawn aesthetic
- **Rive**: Animation timeline, state machines

---

**Next Step**: Create interactive HTML/Canvas prototype using Konva.js
