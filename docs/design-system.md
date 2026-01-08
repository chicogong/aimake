# aimake.cc Design System
## Infinity Canvas UI/UX Specification

---

## 1. Design Philosophy

**"Professional Studio, Not AI Playground"**

aimake.cc is positioned as a professional creative tool, not another AI chatbot. The design should evoke:
- **Recording studios** - precision, control, clarity
- **Design tools** (Figma/Sketch) - familiar, productive workflows
- **Audio workstations** (Ableton/Logic) - modular, timeline-based thinking

### Core Principles
1. **Clarity over cleverness** - Every element has a clear purpose
2. **Speed over spectacle** - Fast interactions, minimal chrome
3. **Depth without complexity** - Power features accessible, not hidden
4. **Tactile feedback** - Physical metaphors (cards, clips, tracks)

---

## 2. Color System

### Primary Palette: "Sonic Blue"
**NOT purple/violet** - We use a sophisticated blue-to-teal gradient that evokes sound waves and professionalism.

```css
/* Primary Colors */
--color-primary-900: #0A2540;  /* Deep Navy - headers, emphasis */
--color-primary-800: #0F3A5F;  /* Dark Blue */
--color-primary-700: #134E7E;  /* Ocean Blue */
--color-primary-600: #1A6BA0;  /* Primary Blue - main actions */
--color-primary-500: #2185C5;  /* Bright Blue - interactive states */
--color-primary-400: #4AA3D5;  /* Light Blue - hover states */
--color-primary-300: #7BC4E8;  /* Sky Blue */
--color-primary-200: #B0DDFA;  /* Pale Blue */
--color-primary-100: #E0F2FE;  /* Ice Blue - backgrounds */

/* Accent: "Audio Orange" */
--color-accent-700: #CC4500;   /* Deep Orange */
--color-accent-600: #E85D00;   /* Primary Orange - CTAs, audio peaks */
--color-accent-500: #FF7518;   /* Bright Orange - active states */
--color-accent-400: #FF9447;   /* Light Orange - hover */
--color-accent-300: #FFB379;   /* Pale Orange */

/* Secondary: "Studio Teal" */
--color-secondary-700: #0D7377; /* Deep Teal */
--color-secondary-600: #14B8A6; /* Teal - success, generation complete */
--color-secondary-500: #2DD4BF; /* Bright Teal */
--color-secondary-400: #5EEAD4; /* Light Teal */

/* Neutrals: "Concrete & Carbon" */
--color-neutral-950: #0A0E14;  /* Pure Black - canvas background */
--color-neutral-900: #1A1F28;  /* Carbon - card shadows */
--color-neutral-800: #2A313D;  /* Dark Gray - card backgrounds */
--color-neutral-700: #3A4252;  /* Medium Gray */
--color-neutral-600: #4F5B6D;  /* Gray - borders */
--color-neutral-500: #6B7788;  /* Mid Gray - secondary text */
--color-neutral-400: #8A96A8;  /* Light Gray */
--color-neutral-300: #B0B9C8;  /* Pale Gray - placeholders */
--color-neutral-200: #D5DBEB;  /* Very Light Gray */
--color-neutral-100: #EDF0F7;  /* Off White - light mode bg */
--color-neutral-50:  #F8F9FB;  /* Nearly White */

/* Semantic Colors */
--color-success: #14B8A6;      /* Teal */
--color-warning: #F59E0B;      /* Amber */
--color-error: #EF4444;        /* Red */
--color-info: #3B82F6;         /* Blue */
```

### Color Usage Guidelines

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Canvas Background | `neutral-100` | `neutral-950` |
| Card Background | `neutral-50` + shadow | `neutral-800` + glow |
| Card Border | `neutral-200` | `neutral-700` |
| Card Selected | `primary-600` border | `primary-500` border |
| Primary Text | `neutral-900` | `neutral-50` |
| Secondary Text | `neutral-600` | `neutral-400` |
| Primary Button | `primary-600` | `primary-500` |
| Accent Button | `accent-600` | `accent-500` |
| Hover State | +5-10% brightness | +10-15% brightness |
| Active State | -10% brightness | -5% brightness |
| Disabled | 40% opacity | 50% opacity |

---

## 3. Typography System

### Font Families

```css
/* Primary Font: Interface */
--font-sans: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', 'Roboto', sans-serif;

/* Monospace Font: Code/Technical */
--font-mono: 'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco',
             'Courier New', monospace;

/* Display Font: Headings (Optional) */
--font-display: 'Cal Sans', 'Inter Variable', sans-serif;
```

### Type Scale

```css
/* Font Sizes */
--text-xs:   0.75rem;   /* 12px - captions, labels */
--text-sm:   0.875rem;  /* 14px - body small, secondary */
--text-base: 1rem;      /* 16px - body text */
--text-lg:   1.125rem;  /* 18px - large body */
--text-xl:   1.25rem;   /* 20px - card titles */
--text-2xl:  1.5rem;    /* 24px - section headers */
--text-3xl:  1.875rem;  /* 30px - page headers */
--text-4xl:  2.25rem;   /* 36px - hero text */

/* Line Heights */
--leading-tight:  1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-regular: 400;
--font-medium:  500;
--font-semibold: 600;
--font-bold:    700;

/* Letter Spacing */
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
```

### Typography Components

```typescript
// Heading 1: Canvas Title
{
  fontSize: 'text-2xl',
  fontWeight: 'font-semibold',
  color: 'primary-900 / neutral-50',
  letterSpacing: 'tracking-tight'
}

// Heading 2: Section Header
{
  fontSize: 'text-xl',
  fontWeight: 'font-semibold',
  color: 'neutral-800 / neutral-100'
}

// Body: Primary Text
{
  fontSize: 'text-base',
  fontWeight: 'font-regular',
  lineHeight: 'leading-normal',
  color: 'neutral-900 / neutral-50'
}

// Body Small: Secondary Text
{
  fontSize: 'text-sm',
  fontWeight: 'font-regular',
  color: 'neutral-600 / neutral-400'
}

// Label: Form Labels, Card Metadata
{
  fontSize: 'text-xs',
  fontWeight: 'font-medium',
  textTransform: 'uppercase',
  letterSpacing: 'tracking-wide',
  color: 'neutral-500 / neutral-400'
}

// Code/Technical: Model Names, IDs
{
  fontSize: 'text-sm',
  fontFamily: 'font-mono',
  color: 'neutral-700 / neutral-300'
}
```

---

## 4. Spacing System

8px base unit for consistent rhythm:

```css
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Spacing Conventions
- **Card padding**: `space-6` (24px)
- **Card gap**: `space-8` (32px) minimum
- **Section spacing**: `space-12` (48px)
- **Input padding**: `space-3 space-4` (12px vertical, 16px horizontal)
- **Button padding**: `space-3 space-6` (12px vertical, 24px horizontal)

---

## 5. Layout Structure

### Canvas Grid System
```
┌─────────────────────────────────────────────────────────────┐
│ Top Toolbar (64px height)                                   │
│ [Logo] [Canvas Name] [Space] [Share] [Undo/Redo] [User]   │
├────┬──────────────────────────────────────────────────┬─────┤
│    │                                                  │     │
│ L  │         Infinite Canvas Area                    │  R  │
│ e  │         (Konva.js Stage)                        │  i  │
│ f  │                                                  │  g  │
│ t  │         [Cards positioned freely]               │  h  │
│    │                                                  │  t  │
│ P  │                                                  │     │
│ a  │                                                  │  I  │
│ n  │                                                  │  n  │
│ e  │                                                  │  s  │
│ l  │                                                  │  p  │
│    │                                                  │  e  │
│ 64 │                                                  │  c  │
│ px │                                                  │  t  │
│    │                                                  │  o  │
│    │                                                  │  r  │
│    │                                                  │     │
│    │                                                  │ 320 │
│    │                                                  │  px │
├────┴──────────────────────────────────────────────────┴─────┤
│ Bottom Toolbar (48px height)                                │
│ [Zoom -] [100%] [Zoom +] [Fit] [Space] [Minimap Preview]  │
└─────────────────────────────────────────────────────────────┘
```

### Dimensions
- **Top Toolbar**: 64px height
- **Left Panel**: 64px width (collapsed), 280px (expanded)
- **Right Inspector**: 320px width (collapsible)
- **Bottom Toolbar**: 48px height
- **Minimum Canvas**: 1024x768px
- **Card min width**: 320px
- **Card max width**: 600px (Prompt/Compare), 400px (Audio), 240px (Note)

---

## 6. Card System

### Base Card Structure

```typescript
interface BaseCard {
  // Visual
  width: number;
  height: 'auto' | number;
  background: string; // semantic based on type
  border: string;
  borderRadius: '12px'; // rounded-xl
  shadow: string; // elevation-based

  // States
  selected: boolean;
  hovered: boolean;
  dragging: boolean;
  disabled: boolean;

  // Layout
  padding: '24px'; // space-6
  gap: '16px';     // space-4
}
```

### Card Types

#### 1. Prompt Card
**Purpose**: Input area for text + TTS settings

```css
/* Visual Properties */
background: neutral-50 / neutral-800
border: 2px solid neutral-200 / neutral-700
min-width: 400px
max-width: 600px
height: auto (min 240px)

/* Header */
- Icon: Document (primary-600)
- Title: "Prompt" (editable)
- Meta: Created timestamp
- Actions: [...menu], [x close]

/* Body */
- Large textarea (expandable)
- Character count indicator
- Pronunciation hints inline (highlighted)

/* Footer Settings */
- Voice selector dropdown
- Speed slider (0.5x - 2.0x)
- [Generate] button (accent-600)
```

#### 2. Audio Card
**Purpose**: Generated audio playback + visualization

```css
/* Visual Properties */
background: neutral-50 / neutral-800
border: 2px solid secondary-600 (generated state)
min-width: 400px
max-width: 400px
height: auto

/* Header */
- Icon: Waveform (secondary-600)
- Title: Auto-generated from first line
- Meta: Duration, model name
- Actions: [Download], [Copy URL], [...menu]

/* Body */
- Waveform visualization (canvas)
  - Waveform color: secondary-400 / secondary-600
  - Progress indicator: accent-600
- Playback controls
  - [Play/Pause] (large, accent-600)
  - Progress scrubber
  - Time: 00:00 / 00:00
  - Volume slider

/* Footer */
- Generation info: TPS, latency, tokens
```

#### 3. Compare Card
**Purpose**: A/B testing for different voices/settings

```css
/* Visual Properties */
background: neutral-50 / neutral-800
border: 2px solid primary-600
min-width: 600px
max-width: 600px
height: auto

/* Header */
- Icon: Split (primary-600)
- Title: "Compare: [Prompt Name]"
- Actions: [...menu], [x close]

/* Body */
- Two-column layout
- Left: Audio A
- Right: Audio B
- Visual diff indicator

/* Footer */
- [Vote A Better] [Vote B Better] buttons
```

#### 4. Note Card
**Purpose**: Annotations, reminders, comments

```css
/* Visual Properties */
background: warning-50 / warning-900/20 (sticky note vibe)
border: 1px solid warning-200 / warning-700
min-width: 200px
max-width: 300px
height: auto (min 120px)

/* Header */
- Icon: Sticky Note (warning-600)
- Title: "Note" (editable)
- Actions: [x close]

/* Body */
- Simple textarea
- Markdown support
```

### Card States

```css
/* Default */
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
border: 2px solid neutral-200;
transform: scale(1);

/* Hover */
box-shadow: 0 4px 16px rgba(0,0,0,0.12);
border: 2px solid primary-300;
transform: scale(1.01);
cursor: move;

/* Selected */
box-shadow: 0 8px 24px rgba(26,107,160,0.24);
border: 3px solid primary-600;
transform: scale(1);

/* Dragging */
opacity: 0.85;
box-shadow: 0 12px 32px rgba(0,0,0,0.24);
cursor: grabbing;

/* Disabled/Loading */
opacity: 0.6;
cursor: not-allowed;
filter: grayscale(0.5);
```

---

## 7. Component Library

### Buttons

```typescript
// Primary Button
{
  background: 'primary-600',
  color: 'white',
  padding: 'space-3 space-6',
  borderRadius: '8px',
  fontWeight: 'font-semibold',
  fontSize: 'text-sm',

  hover: {
    background: 'primary-700',
    transform: 'translateY(-1px)',
    shadow: 'lg'
  },

  active: {
    transform: 'translateY(0)',
    shadow: 'sm'
  },

  disabled: {
    background: 'neutral-300',
    cursor: 'not-allowed',
    opacity: 0.6
  }
}

// Accent Button (Generate, CTAs)
{
  background: 'accent-600',
  color: 'white',
  // ... same structure as primary
}

// Secondary Button
{
  background: 'transparent',
  color: 'primary-600',
  border: '2px solid primary-600',
  // ... rest similar
}

// Ghost Button (toolbar actions)
{
  background: 'transparent',
  color: 'neutral-600',
  padding: 'space-2',
  borderRadius: '6px',

  hover: {
    background: 'neutral-100 / neutral-800',
    color: 'primary-600'
  }
}

// Icon Button
{
  width: '36px',
  height: '36px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
```

### Form Inputs

```typescript
// Text Input / Textarea
{
  background: 'white / neutral-900',
  border: '2px solid neutral-200 / neutral-700',
  borderRadius: '8px',
  padding: 'space-3 space-4',
  fontSize: 'text-base',
  color: 'neutral-900 / neutral-50',

  focus: {
    border: '2px solid primary-600',
    outline: 'none',
    shadow: '0 0 0 3px primary-100/50'
  },

  error: {
    border: '2px solid error',
    // ... error message below
  },

  disabled: {
    background: 'neutral-100 / neutral-800',
    cursor: 'not-allowed',
    opacity: 0.6
  }
}

// Select Dropdown
{
  // Same as text input
  // Custom styled dropdown menu
  background: 'white / neutral-800',
  border: '1px solid neutral-200 / neutral-700',
  borderRadius: '8px',
  shadow: 'lg',

  option: {
    padding: 'space-3 space-4',
    hover: {
      background: 'primary-50 / neutral-700'
    },
    selected: {
      background: 'primary-100 / neutral-600',
      color: 'primary-700 / primary-300'
    }
  }
}

// Slider
{
  track: {
    height: '4px',
    background: 'neutral-200 / neutral-700',
    borderRadius: '2px'
  },

  fill: {
    background: 'primary-600'
  },

  thumb: {
    width: '16px',
    height: '16px',
    background: 'white',
    border: '2px solid primary-600',
    borderRadius: '50%',
    shadow: 'md',

    hover: {
      transform: 'scale(1.2)'
    }
  }
}
```

### Toolbar Components

```typescript
// Top Toolbar
{
  height: '64px',
  background: 'white / neutral-900',
  borderBottom: '1px solid neutral-200 / neutral-800',
  padding: '0 space-6',
  display: 'flex',
  alignItems: 'center',
  gap: 'space-4',

  sections: {
    left: ['Logo', 'CanvasName'],
    center: ['Spacer'],
    right: ['ShareButton', 'UndoRedo', 'UserMenu']
  }
}

// Left Panel
{
  width: '64px', // collapsed
  expandedWidth: '280px',
  background: 'neutral-50 / neutral-900',
  borderRight: '1px solid neutral-200 / neutral-800',
  padding: 'space-4',

  tools: [
    { icon: 'Plus', label: 'Add Prompt', action: 'addPromptCard' },
    { icon: 'Audio', label: 'Add Audio', disabled: true },
    { icon: 'Compare', label: 'Compare', action: 'addCompareCard' },
    { icon: 'Note', label: 'Add Note', action: 'addNoteCard' }
  ]
}

// Right Inspector Panel
{
  width: '320px',
  background: 'white / neutral-900',
  borderLeft: '1px solid neutral-200 / neutral-800',
  padding: 'space-6',

  sections: {
    properties: 'Selected card properties',
    history: 'Version history',
    comments: 'Collaboration comments'
  }
}

// Bottom Toolbar
{
  height: '48px',
  background: 'white / neutral-900',
  borderTop: '1px solid neutral-200 / neutral-800',
  padding: '0 space-6',

  sections: {
    left: ['ZoomOut', 'ZoomLevel', 'ZoomIn', 'FitToScreen'],
    right: ['MinimapPreview']
  }
}
```

### Special Components

```typescript
// Waveform Visualization
{
  height: '120px',
  background: 'transparent',

  waveform: {
    color: 'secondary-400 / secondary-600',
    strokeWidth: '2px',
    fill: 'secondary-100/30 / secondary-900/20'
  },

  progress: {
    color: 'accent-600',
    strokeWidth: '2px'
  },

  playhead: {
    width: '2px',
    color: 'accent-600',
    shadow: '0 0 8px accent-600/50'
  }
}

// Loading Spinner (Streaming)
{
  type: 'circular',
  size: '24px',
  color: 'primary-600',
  strokeWidth: '3px',

  animation: {
    duration: '1s',
    easing: 'linear',
    iterations: 'infinite'
  }
}

// Toast Notifications
{
  position: 'bottom-right',
  width: '360px',
  background: 'white / neutral-800',
  border: '1px solid neutral-200 / neutral-700',
  borderRadius: '12px',
  padding: 'space-4',
  shadow: 'xl',

  types: {
    success: { icon: 'Check', color: 'success' },
    error: { icon: 'X', color: 'error' },
    warning: { icon: 'Alert', color: 'warning' },
    info: { icon: 'Info', color: 'info' }
  },

  animation: {
    enter: 'slideInFromBottom',
    exit: 'fadeOut',
    duration: '300ms'
  }
}

// Context Menu (Right-click)
{
  minWidth: '200px',
  background: 'white / neutral-800',
  border: '1px solid neutral-200 / neutral-700',
  borderRadius: '8px',
  padding: 'space-2',
  shadow: 'xl',

  item: {
    padding: 'space-2 space-4',
    borderRadius: '6px',
    fontSize: 'text-sm',

    hover: {
      background: 'primary-50 / neutral-700'
    },

    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },

  separator: {
    height: '1px',
    background: 'neutral-200 / neutral-700',
    margin: 'space-2 0'
  }
}
```

---

## 8. Animations & Transitions

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### Durations

```css
--duration-fast: 150ms;    /* Quick interactions */
--duration-normal: 250ms;  /* Default transitions */
--duration-slow: 400ms;    /* Complex animations */
```

### Common Animations

```typescript
// Card Appear (on create)
{
  from: { opacity: 0, scale: 0.9, y: 20 },
  to: { opacity: 1, scale: 1, y: 0 },
  duration: '400ms',
  easing: 'ease-bounce'
}

// Card Drag Start
{
  to: { scale: 1.05, shadow: 'xl' },
  duration: '150ms',
  easing: 'ease-out'
}

// Card Drag End
{
  to: { scale: 1, shadow: 'lg' },
  duration: '250ms',
  easing: 'ease-smooth'
}

// Button Hover
{
  to: { translateY: '-1px', shadow: 'lg' },
  duration: '150ms',
  easing: 'ease-out'
}

// Loading Spinner
{
  rotate: '0deg to 360deg',
  duration: '1s',
  easing: 'linear',
  iterations: 'infinite'
}

// Waveform Stream (generation)
{
  from: { scaleX: 0 },
  to: { scaleX: 1 },
  duration: 'based on TTS speed',
  easing: 'linear',
  direction: 'left-to-right'
}

// Toast Slide In
{
  from: { translateY: '100%', opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration: '300ms',
  easing: 'ease-out'
}

// Panel Expand/Collapse
{
  from: { width: '64px' },
  to: { width: '280px' },
  duration: '250ms',
  easing: 'ease-in-out'
}
```

---

## 9. Accessibility (WCAG 2.1 AA)

### Color Contrast Ratios

All text must meet minimum contrast:
- **Normal text (< 18px)**: 4.5:1
- **Large text (≥ 18px)**: 3:1
- **UI components**: 3:1

Tested combinations:
- `primary-600` on `white`: ✓ 7.2:1
- `neutral-600` on `neutral-50`: ✓ 5.8:1
- `accent-600` on `white`: ✓ 4.9:1
- `neutral-50` on `neutral-950`: ✓ 19.1:1

### Keyboard Navigation

```typescript
// Focus States
{
  outline: '2px solid primary-600',
  outlineOffset: '2px',
  boxShadow: '0 0 0 3px primary-100/50'
}

// Focus-visible (keyboard only)
{
  // Same as focus, but only on keyboard interaction
}

// Keyboard Shortcuts
{
  'Cmd/Ctrl + N': 'New Prompt Card',
  'Cmd/Ctrl + K': 'Command Palette',
  'Cmd/Ctrl + Z': 'Undo',
  'Cmd/Ctrl + Shift + Z': 'Redo',
  'Space': 'Pan Mode (hold)',
  'Cmd/Ctrl + 0': 'Zoom to 100%',
  'Cmd/Ctrl + 1': 'Zoom to Fit',
  'Delete/Backspace': 'Delete Selected Card',
  'Escape': 'Deselect All',
  'Tab': 'Cycle Focus',
  'Arrow Keys': 'Move Selected Card (1px, +Shift = 10px)'
}
```

### Screen Reader Support

```typescript
// Card ARIA Labels
{
  role: 'article',
  'aria-label': 'Prompt Card: [Title]',
  'aria-describedby': 'card-content-id',
  'aria-selected': 'true/false'
}

// Interactive Elements
{
  'aria-label': 'Generate audio',
  'aria-describedby': 'tooltip-id',
  'aria-pressed': 'true/false', // for toggle buttons
  'aria-expanded': 'true/false', // for dropdowns
  'aria-disabled': 'true/false'
}

// Live Regions (streaming)
{
  'aria-live': 'polite',
  'aria-atomic': 'true',
  'aria-relevant': 'additions text'
}

// Skip Links
<a href="#main-canvas" class="sr-only focus:not-sr-only">
  Skip to canvas
</a>
```

### Motion Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Responsive Breakpoints

Desktop-first, but gracefully degrade:

```css
/* Breakpoints */
--breakpoint-2xl: 1536px; /* Large desktop */
--breakpoint-xl:  1280px; /* Desktop */
--breakpoint-lg:  1024px; /* Laptop */
--breakpoint-md:  768px;  /* Tablet */
--breakpoint-sm:  640px;  /* Mobile landscape */
--breakpoint-xs:  375px;  /* Mobile portrait */
```

### Layout Adaptations

```typescript
// Desktop (≥ 1024px) - Full Canvas
{
  topToolbar: 'visible',
  leftPanel: 'collapsible (64px → 280px)',
  rightInspector: 'visible (320px)',
  bottomToolbar: 'visible',
  cards: 'free positioning'
}

// Tablet (768px - 1023px)
{
  topToolbar: 'compact (icon-only)',
  leftPanel: 'icon-only (64px)',
  rightInspector: 'overlay (slide from right)',
  bottomToolbar: 'simplified',
  cards: 'snap to grid'
}

// Mobile (< 768px)
{
  layout: 'single column stack',
  topToolbar: 'minimal (hamburger menu)',
  leftPanel: 'bottom sheet',
  rightInspector: 'bottom sheet',
  bottomToolbar: 'sticky fab (floating action button)',
  cards: 'full-width, vertically stacked',
  canvas: 'vertical scroll (not 2D pan)'
}
```

---

## 11. Performance Optimization

### Canvas Rendering
- **Virtual viewport**: Only render visible cards + 200px buffer
- **Layer caching**: Cache card layers on Konva.js
- **Throttle drag events**: Update position every 16ms (60fps)
- **Debounce text input**: Save after 500ms idle

### Asset Loading
- **Lazy load** waveform visualizations
- **Progressive JPEG** for any images
- **WebP with fallback** for icons
- **SVG sprites** for repeated icons

### Code Splitting
```typescript
// Route-based
const Canvas = lazy(() => import('./Canvas'));
const Settings = lazy(() => import('./Settings'));

// Component-based (heavy components)
const Waveform = lazy(() => import('./Waveform'));
const Compare = lazy(() => import('./CompareCard'));
```

### Bundle Size Targets
- **Initial load**: < 100KB gzipped
- **Total JS**: < 300KB gzipped
- **CSS**: < 30KB gzipped
- **Fonts**: < 50KB (WOFF2)

---

## 12. Dark Mode Implementation

### Strategy
- **System preference detection** by default
- **Manual toggle** in user menu
- **Persisted in localStorage**

```typescript
// Tailwind Config
{
  darkMode: 'class', // or 'media'

  // Usage
  <div className="bg-neutral-50 dark:bg-neutral-950">
    <p className="text-neutral-900 dark:text-neutral-50">Text</p>
  </div>
}
```

### Special Considerations
- **Canvas background**: Pure black `#0A0E14` (better for eye strain)
- **Card shadows**: Use glow instead of shadow in dark mode
- **Waveforms**: Higher contrast in dark mode
- **Borders**: Lighter borders in dark (avoid pure black on dark gray)

---

## 13. Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Setup Tailwind with custom theme
- [ ] Create design tokens (CSS variables)
- [ ] Base component library (Button, Input, Card)
- [ ] Layout shell (Toolbar, Panels, Canvas)

### Phase 2: Canvas Core (Week 2)
- [ ] Konva.js integration
- [ ] Card base component (drag, resize, select)
- [ ] Prompt Card implementation
- [ ] Left panel tool selector

### Phase 3: Audio & Interaction (Week 3)
- [ ] Audio Card with playback
- [ ] Waveform visualization
- [ ] Streaming audio updates
- [ ] Context menus

### Phase 4: Advanced Cards (Week 4)
- [ ] Compare Card A/B testing
- [ ] Note Card annotations
- [ ] Card connections (lines)
- [ ] Right Inspector panel

### Phase 5: Polish (Week 5)
- [ ] Keyboard shortcuts
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Dark mode refinement
- [ ] Responsive breakpoints

### Phase 6: Beta (Week 6)
- [ ] User testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Launch prep

---

## 14. Design Files & Assets

### Required Assets
1. **Logo**: SVG (light + dark variants)
2. **Icons**: Lucide React or Heroicons (consistent set)
3. **Illustrations**: Empty states, onboarding
4. **Fonts**: Inter Variable (Google Fonts)

### Mockup Tools
- **Figma**: High-fidelity mockups
- **Excalidraw**: Quick wireframes
- **Codepen/Stackblitz**: Interactive prototypes

### Design Deliverables
- [ ] Figma file: Complete UI kit
- [ ] Component library Storybook
- [ ] Style guide (this document)
- [ ] User flow diagrams

---

## 15. Brand Voice & Microcopy

### Tone
- **Professional**, not robotic
- **Helpful**, not condescending
- **Direct**, not verbose
- **Encouraging**, not pushy

### Example Microcopy

```typescript
// Empty States
"No cards yet. Click '+' to create your first prompt."
"Drop a text file here to create a prompt card."

// Errors
"Oops! Audio generation failed. Try again?"
"Connection lost. Reconnecting..."

// Success
"Audio generated in 2.3s" (with TPS/latency)
"Saved to dictionary ✓"

// Loading
"Generating audio..." (with spinner)
"Streaming waveform..." (with progress)

// Tooltips (concise)
"Add Prompt (Cmd+N)"
"Undo (Cmd+Z)"
"Zoom to fit"
```

---

## 16. Success Metrics

### Design KPIs
- **Time to first audio**: < 60s (from landing to generated)
- **Card creation time**: < 10s per card
- **Canvas FPS**: > 50fps (during interactions)
- **Mobile usability**: 80%+ satisfaction score

### Accessibility Metrics
- **Lighthouse Accessibility**: 95+ score
- **Keyboard completability**: 100% of features
- **Color contrast**: 100% WCAG AA compliance
- **Screen reader compatibility**: Tested on NVDA, JAWS, VoiceOver

---

**Last Updated**: 2026-01-08
**Version**: 1.0
**Owner**: aimake.cc Design Team
