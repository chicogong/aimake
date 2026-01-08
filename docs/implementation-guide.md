# Infinity Canvas Implementation Guide

## Project Structure

```
aimake/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── InfinityCanvas.tsx       # Main Konva canvas
│   │   │   │   ├── CanvasCard.tsx           # Base card component
│   │   │   │   ├── PromptCard.tsx           # Prompt card
│   │   │   │   ├── AudioCard.tsx            # Audio playback card
│   │   │   │   ├── CompareCard.tsx          # A/B test card
│   │   │   │   ├── NoteCard.tsx             # Annotation card
│   │   │   │   └── Waveform.tsx             # Audio visualization
│   │   │   ├── layout/
│   │   │   │   ├── TopToolbar.tsx           # Main toolbar
│   │   │   │   ├── LeftPanel.tsx            # Tool selector
│   │   │   │   ├── RightInspector.tsx       # Properties panel
│   │   │   │   ├── BottomToolbar.tsx        # Zoom controls
│   │   │   │   └── CanvasLayout.tsx         # Layout wrapper
│   │   │   └── ui/
│   │   │       ├── Button.tsx               # Button variants
│   │   │       ├── Input.tsx                # Form inputs
│   │   │       ├── Select.tsx               # Dropdown
│   │   │       ├── Slider.tsx               # Range slider
│   │   │       ├── Toast.tsx                # Notifications
│   │   │       └── ContextMenu.tsx          # Right-click menu
│   │   ├── hooks/
│   │   │   ├── useCanvas.ts                 # Canvas state management
│   │   │   ├── useAudio.ts                  # Audio playback
│   │   │   ├── useKeyboard.ts               # Keyboard shortcuts
│   │   │   └── useToast.ts                  # Toast notifications
│   │   ├── stores/
│   │   │   ├── canvasStore.ts               # Zustand store for canvas
│   │   │   └── uiStore.ts                   # UI state (panels, theme)
│   │   ├── lib/
│   │   │   ├── audio.ts                     # Audio utilities
│   │   │   ├── canvas.ts                    # Canvas helpers
│   │   │   └── utils.ts                     # Common utilities
│   │   ├── styles/
│   │   │   ├── globals.css                  # Global styles + Tailwind
│   │   │   └── themes.css                   # Design tokens
│   │   ├── types/
│   │   │   ├── card.ts                      # Card interfaces
│   │   │   └── canvas.ts                    # Canvas types
│   │   ├── App.tsx                          # Root component
│   │   └── main.tsx                         # Entry point
│   ├── public/
│   │   └── fonts/                           # Inter Variable
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
```

## Installation Steps

### 1. Initialize React + TypeScript + Vite

```bash
cd /Users/haorangong/Github/chicogong/aimake
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### 2. Install Dependencies

```bash
# Core
npm install react react-dom
npm install -D typescript @types/react @types/react-dom

# Canvas
npm install react-konva konva

# State Management
npm install zustand immer

# Styling
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# UI Components (optional - for faster dev)
npm install @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-dropdown-menu

# Audio
npm install wavesurfer.js

# Icons
npm install lucide-react

# Utils
npm install date-fns nanoid
```

### 3. Setup Tailwind

```bash
npx tailwindcss init -p
```

## Configuration Files

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E0F2FE',
          100: '#B0DDFA',
          200: '#7BC4E8',
          300: '#4AA3D5',
          400: '#2185C5',
          500: '#1A6BA0',
          600: '#134E7E',
          700: '#0F3A5F',
          800: '#0A2540',
          900: '#0A2540',
        },
        accent: {
          50: '#FFF4ED',
          100: '#FFE5D0',
          200: '#FFCFA8',
          300: '#FFB379',
          400: '#FF9447',
          500: '#FF7518',
          600: '#E85D00',
          700: '#CC4500',
        },
        secondary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0D7377',
        },
        neutral: {
          50: '#F8F9FB',
          100: '#EDF0F7',
          200: '#D5DBEB',
          300: '#B0B9C8',
          400: '#8A96A8',
          500: '#6B7788',
          600: '#4F5B6D',
          700: '#3A4252',
          800: '#2A313D',
          900: '#1A1F28',
          950: '#0A0E14',
        },
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.12)',
        'card-selected': '0 8px 24px rgba(26,107,160,0.24)',
        'card-dragging': '0 12px 32px rgba(0,0,0,0.24)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'canvas-vendor': ['react-konva', 'konva'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-konva', 'konva'],
  },
})
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path Aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@stores/*": ["./src/stores/*"],
      "@lib/*": ["./src/lib/*"],
      "@types/*": ["./src/types/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Development Workflow

### 1. Start Development Server

```bash
cd frontend
npm run dev
```

### 2. Component Development Order

1. **Week 1: Foundation**
   - Setup + design tokens
   - Base UI components (Button, Input, etc.)
   - Layout shell (TopToolbar, LeftPanel, etc.)

2. **Week 2: Canvas Core**
   - InfinityCanvas with Konva.js
   - CanvasCard base component
   - PromptCard implementation

3. **Week 3: Audio**
   - AudioCard with playback
   - Waveform visualization
   - Real-time streaming

4. **Week 4: Advanced Features**
   - CompareCard A/B testing
   - NoteCard annotations
   - RightInspector panel

5. **Week 5: Polish**
   - Keyboard shortcuts
   - Accessibility
   - Performance optimization

### 3. Testing Strategy

```bash
# Unit tests (Vitest)
npm install -D vitest @testing-library/react @testing-library/user-event

# E2E tests (Playwright)
npm install -D @playwright/test

# Run tests
npm run test
npm run test:e2e
```

### 4. Code Style

```bash
# ESLint + Prettier
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Pre-commit hooks
npm install -D husky lint-staged
npx husky install
```

## Integration with Backend

### API Client Setup

```typescript
// src/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_CDN_URL=https://cdn.aimake.cc
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Lazy load heavy components
const Waveform = lazy(() => import('./Waveform'));
const CompareCard = lazy(() => import('./CompareCard'));

// Preload on hover
<Button
  onMouseEnter={() => import('./CompareCard')}
  onClick={() => setShowCompare(true)}
>
  Compare
</Button>
```

### 2. Memoization

```typescript
// Memoize expensive calculations
const waveformData = useMemo(() =>
  processAudioBuffer(audioBuffer),
  [audioBuffer]
);

// Memoize callbacks
const handleDrag = useCallback((e: KonvaEventObject<DragEvent>) => {
  updateCardPosition(id, e.target.x(), e.target.y());
}, [id]);
```

### 3. Virtual Rendering

```typescript
// Only render visible cards
const visibleCards = cards.filter(card =>
  isInViewport(card, viewport)
);

return visibleCards.map(card =>
  <Card key={card.id} {...card} />
);
```

## Deployment

### Build for Production

```bash
npm run build
npm run preview # Test production build
```

### Docker Setup

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Cloudflare Pages Deployment

```bash
# Install Wrangler CLI
npm install -g wrangler

# Deploy
wrangler pages publish dist
```

## Monitoring & Analytics

### Sentry Integration

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

```typescript
// Custom metrics
import { reportWebVitals } from './lib/analytics';

reportWebVitals(({ name, value }) => {
  // Send to analytics
  console.log(`${name}: ${value}`);
});
```

## Troubleshooting

### Common Issues

1. **Konva.js rendering issues**
   - Ensure Stage has explicit width/height
   - Use `useEffect` to update stage on resize
   - Cache complex shapes with `cache()`

2. **Audio playback problems**
   - Check CORS headers on audio files
   - Use proper audio formats (MP3, WAV)
   - Handle autoplay policies

3. **Performance bottlenecks**
   - Profile with React DevTools
   - Check for unnecessary re-renders
   - Optimize Konva layer count

4. **TypeScript errors**
   - Ensure Konva types are installed
   - Use proper event types from `konva`
   - Check path aliases in tsconfig

## Next Steps

1. Review design-system.md for visual specs
2. Start with UI component library
3. Build canvas infrastructure
4. Integrate with backend API
5. Add real-time features (WebSocket)
6. Performance optimization
7. Accessibility audit
8. User testing

---

**Last Updated**: 2026-01-08
**Version**: 1.0
