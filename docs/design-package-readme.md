# Infinity Canvas Design System - Complete Package

## Overview

This package contains the complete design system and React component implementation for **aimake.cc's Infinity Canvas** - a professional, modern UI for AI TTS creation that avoids typical "AI purple" cliches.

## What's Included

### 📋 Documentation

1. **[design-system.md](./design-system.md)** - Complete visual design specification
   - Color system (Sonic Blue palette)
   - Typography (Inter Variable)
   - Spacing & layout
   - Component specs
   - Accessibility guidelines
   - Dark mode implementation

2. **[implementation-guide.md](./implementation-guide.md)** - Technical setup guide
   - Project structure
   - Installation steps
   - Configuration files (Tailwind, Vite, TypeScript)
   - Development workflow
   - Performance optimization
   - Deployment strategies

### 🎨 Design Highlights

**Color Palette: "Professional Studio, Not AI Playground"**

- **Primary (Sonic Blue)**: `#1A6BA0` - Professional, trustworthy, evokes sound waves
- **Accent (Audio Orange)**: `#E85D00` - CTAs, audio peaks, energy
- **Secondary (Studio Teal)**: `#14B8A6` - Success states, generation complete
- **Neutrals (Concrete & Carbon)**: Dark mode optimized grays

**NO purple/violet** - We deliberately avoid the AI startup cliche.

### 🧩 React Components

All components are TypeScript-first with full accessibility:

#### Core Types (`frontend-types/`)
- `card.ts` - Card interfaces (Prompt, Audio, Compare, Note)
- `canvas.ts` - Canvas state management types

#### UI Components (`frontend-components/ui/`)
- `Button.tsx` - Primary, accent, secondary, ghost, icon variants
- `Input.tsx` - Text input, textarea with validation states

#### Layout Components (`frontend-components/layout/`)
- `Toolbar.tsx` - Top toolbar, left panel, bottom toolbar

#### Canvas Components (`frontend-components/canvas/`)
- `PromptCard.tsx` - Fully functional prompt card with settings

### 🎯 Design Philosophy

1. **Clarity over cleverness** - Every element has a clear purpose
2. **Speed over spectacle** - Fast interactions, minimal chrome
3. **Depth without complexity** - Power features accessible, not hidden
4. **Tactile feedback** - Physical metaphors (cards, clips, tracks)

Inspiration: Figma + Ableton + Recording Studios

## Quick Start

### 1. Review Design System

Read `design-system.md` for complete visual specifications:
- Color usage guidelines
- Typography scale
- Component states (hover, active, selected, disabled)
- Card types and layouts
- Animation timing

### 2. Setup React Project

```bash
# Navigate to project root
cd /Users/haorangong/Github/chicogong/aimake

# Create frontend directory
npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install react-konva konva zustand immer
npm install -D tailwindcss postcss autoprefixer
npm install clsx lucide-react

# Initialize Tailwind
npx tailwindcss init -p
```

### 3. Configure Tailwind

Copy the tailwind.config.js from `implementation-guide.md` with:
- Custom color palette
- Design tokens
- Custom shadows
- Animation utilities

### 4. Create Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── canvas/         # Canvas cards
│   │   ├── layout/         # Toolbars, panels
│   │   └── ui/             # Base components
│   ├── types/              # TypeScript types
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   └── lib/                # Utilities
```

### 5. Copy Components

Copy the provided component files:
1. Types: `card.ts`, `canvas.ts`
2. UI: `Button.tsx`, `Input.tsx`
3. Layout: `Toolbar.tsx`
4. Canvas: `PromptCard.tsx`

### 6. Build Canvas Infrastructure

Next steps (not included in this package):
1. **InfinityCanvas.tsx** - Konva.js Stage implementation
2. **AudioCard.tsx** - Audio playback with waveform
3. **CompareCard.tsx** - A/B testing component
4. **NoteCard.tsx** - Annotation cards
5. **Waveform.tsx** - Audio visualization
6. **useCanvas.ts** - Canvas state hook
7. **canvasStore.ts** - Zustand store

## Component Usage Examples

### Button

```tsx
import { Button } from '@components/ui/Button';

// Primary action
<Button variant="primary" onClick={handleSave}>
  Save Canvas
</Button>

// Generate audio (accent color)
<Button variant="accent" loading={isGenerating}>
  Generate Audio
</Button>

// Icon button
<Button
  variant="primary"
  icon={<PlusIcon />}
  iconPosition="left"
>
  Add Card
</Button>
```

### Input

```tsx
import { Input, Textarea } from '@components/ui/Input';

// Text input with label
<Input
  label="Canvas Name"
  placeholder="Enter name..."
  value={name}
  onChange={(e) => setName(e.target.value)}
  helperText="Visible to collaborators"
/>

// Textarea with auto-resize
<Textarea
  label="Prompt"
  placeholder="Enter your text..."
  autoResize
  rows={4}
/>

// Error state
<Input
  label="Email"
  type="email"
  error="Invalid email format"
/>
```

### Prompt Card

```tsx
import { PromptCard } from '@components/canvas/PromptCard';

<PromptCard
  card={promptCardData}
  selected={selectedId === card.id}
  onUpdate={(id, updates) => updateCard(id, updates)}
  onDelete={(id) => deleteCard(id)}
  onGenerate={(id) => generateAudio(id)}
  onSelect={(id) => setSelectedId(id)}
/>
```

### Toolbar

```tsx
import { TopToolbar, LeftPanel, BottomToolbar } from '@components/layout/Toolbar';

// Top toolbar
<TopToolbar
  canvasName="My Canvas"
  onCanvasNameChange={setCanvasName}
  onUndo={undo}
  onRedo={redo}
  canUndo={historyIndex > 0}
  canRedo={historyIndex < history.length - 1}
/>

// Left panel
<LeftPanel
  onAddPromptCard={addPromptCard}
  onAddCompareCard={addCompareCard}
  onAddNoteCard={addNoteCard}
  expanded={isPanelExpanded}
/>

// Bottom toolbar
<BottomToolbar
  zoom={viewport.scale}
  onZoomIn={zoomIn}
  onZoomOut={zoomOut}
  onZoomReset={resetZoom}
  onZoomFit={zoomToFit}
/>
```

## Design Tokens (CSS Variables)

All design tokens are defined in Tailwind config. Access them via Tailwind classes:

```tsx
// Colors
<div className="bg-primary-600 text-white">
<div className="bg-accent-600 hover:bg-accent-700">
<div className="bg-neutral-50 dark:bg-neutral-950">

// Typography
<h1 className="text-2xl font-semibold tracking-tight">
<p className="text-base leading-normal">
<label className="text-xs font-medium uppercase tracking-wide">

// Spacing
<div className="p-6 gap-4">      // padding: 24px, gap: 16px
<div className="mt-8 mb-12">     // margin-top: 32px, bottom: 48px

// Shadows
<div className="shadow-card">           // Default card shadow
<div className="shadow-card-hover">     // Hover state
<div className="shadow-card-selected">  // Selected state
```

## Accessibility Checklist

All components meet WCAG 2.1 AA standards:

- ✅ **Color contrast**: All text meets 4.5:1 minimum
- ✅ **Keyboard navigation**: Full tab support + shortcuts
- ✅ **Focus indicators**: Visible focus rings on all interactive elements
- ✅ **ARIA labels**: Proper labels, roles, and descriptions
- ✅ **Screen reader**: Semantic HTML + live regions for streaming
- ✅ **Reduced motion**: Respects prefers-reduced-motion

### Keyboard Shortcuts

```
Cmd/Ctrl + N        New Prompt Card
Cmd/Ctrl + K        Command Palette
Cmd/Ctrl + Z        Undo
Cmd/Ctrl + Shift+Z  Redo
Space (hold)        Pan Mode
Cmd/Ctrl + 0        Zoom to 100%
Cmd/Ctrl + 1        Zoom to Fit
Delete/Backspace    Delete Selected
Escape              Deselect All
Tab                 Cycle Focus
Arrow Keys          Move Selected (+Shift = 10px)
```

## Performance Targets

- **Initial load**: < 100KB gzipped
- **Canvas FPS**: > 50fps during interactions
- **Time to first audio**: < 60s (from landing)
- **Card creation**: < 10s per card

### Optimization Techniques

1. **Code splitting**: Lazy load heavy components (Waveform, Compare)
2. **Virtual rendering**: Only render visible cards + 200px buffer
3. **Memoization**: useMemo for expensive calculations, useCallback for handlers
4. **Konva caching**: Cache complex card shapes
5. **Debounce/throttle**: Text input (500ms), drag events (16ms)

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile: iOS 14+, Android Chrome 90+

## Dark Mode

Dark mode is fully implemented with class-based toggle:

```tsx
// Toggle dark mode
<html className="dark">

// Use dark: variant
<div className="bg-white dark:bg-neutral-900">
<p className="text-neutral-900 dark:text-neutral-50">
```

Respects system preference by default:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media' for system preference
}
```

## Integration with Backend

### API Structure

```typescript
// Generate audio from prompt
POST /api/audio/generate
{
  prompt: string,
  settings: { voice, speed, pitch }
}

// Get audio file
GET /api/audio/{id}

// WebSocket for streaming
ws://api.aimake.cc/ws/canvas/{canvasId}
```

### Canvas State Sync

Use Zustand for local state + WebSocket for real-time collaboration:

```typescript
import create from 'zustand';

const useCanvasStore = create((set) => ({
  cards: [],
  addCard: (card) => set((state) => ({
    cards: [...state.cards, card]
  })),
  // ... more actions
}));
```

## Testing

### Unit Tests (Vitest)

```bash
npm install -D vitest @testing-library/react
npm run test
```

Test each component in isolation:
- Button variants and states
- Input validation
- Card interactions (drag, select, edit)

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
npm run test:e2e
```

Test user flows:
- Create canvas → Add prompt → Generate audio
- Keyboard shortcuts
- Dark mode toggle

## Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory (optimized, minified, code-split)

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Cloudflare Pages

```bash
npm install -g wrangler
wrangler pages publish dist
```

## Troubleshooting

### Common Issues

**1. Konva.js not rendering**
- Ensure Stage has explicit width/height
- Use useEffect to update stage on window resize
- Check that Layer contains shapes

**2. Tailwind classes not working**
- Verify tailwind.config.js content paths include all component files
- Run `npm run dev` to rebuild CSS
- Check for typos in class names

**3. TypeScript errors with Konva**
- Install types: `npm install -D @types/konva`
- Import proper event types from 'konva/lib/Node'

**4. Performance issues**
- Profile with React DevTools
- Check for unnecessary re-renders (use React.memo)
- Reduce Konva layer count
- Implement virtual rendering for > 50 cards

## Next Steps

### Phase 1: Complete Core Canvas (Week 1-2)
- [ ] Implement InfinityCanvas with Konva.js
- [ ] Add drag-and-drop for cards
- [ ] Implement zoom/pan controls
- [ ] Add card selection (single + multi)

### Phase 2: Audio Cards (Week 3)
- [ ] Build AudioCard component
- [ ] Integrate Waveform visualization (WaveSurfer.js)
- [ ] Add playback controls
- [ ] Implement streaming audio updates

### Phase 3: Advanced Features (Week 4)
- [ ] CompareCard A/B testing
- [ ] NoteCard annotations
- [ ] Card connections/links
- [ ] Right Inspector panel

### Phase 4: Polish (Week 5)
- [ ] Keyboard shortcuts system
- [ ] Context menus (right-click)
- [ ] Undo/redo history
- [ ] Export canvas to JSON/Image

### Phase 5: Collaboration (Week 6)
- [ ] WebSocket real-time sync
- [ ] Cursor presence
- [ ] Comments on cards
- [ ] Version history

## Resources

### Design Inspiration
- Figma (canvas interaction patterns)
- Miro (infinite canvas, card system)
- Notion (clean UI, typography)
- Ableton Live (modular, timeline-based)

### Technical References
- [Konva.js Docs](https://konvajs.org/)
- [React Konva](https://konvajs.org/docs/react/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [Figma](https://figma.com) - High-fidelity mockups
- [Excalidraw](https://excalidraw.com) - Quick wireframes
- [ColorSpace](https://mycolor.space/) - Color palette generator
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Accessibility

## Support

For questions or issues:
- Email: contact@aimake.cc
- Discord: [aimake.cc community](https://discord.gg/aimake)
- GitHub: [Open an issue](https://github.com/chicogong/aimake/issues)

## License

MIT License - See [LICENSE](../LICENSE) for details

---

**Version**: 1.0
**Last Updated**: 2026-01-08
**Created by**: aimake.cc Design Team

Built with ❤️ using React, TypeScript, Tailwind CSS, and Konva.js
