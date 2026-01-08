# Infinity Canvas Visual Reference

Quick reference guide for designers and developers.

## Color Palette

### Primary: Sonic Blue

Professional, trustworthy blue palette that evokes sound waves and audio production.

```
█ #E0F2FE  primary-100  Ice Blue (backgrounds)
█ #B0DDFA  primary-200  Pale Blue
█ #7BC4E8  primary-300  Sky Blue
█ #4AA3D5  primary-400  Light Blue (hover states)
█ #2185C5  primary-500  Bright Blue (interactive)
█ #1A6BA0  primary-600  PRIMARY - Main actions, brand
█ #134E7E  primary-700  Ocean Blue
█ #0F3A5F  primary-800  Dark Blue
█ #0A2540  primary-900  Deep Navy (emphasis)
```

**Usage:**
- Buttons, links, active states
- Selected cards border
- Focus indicators
- Brand elements

### Accent: Audio Orange

Energetic orange for CTAs, audio visualization, and action items.

```
█ #FFB379  accent-300  Pale Orange
█ #FF9447  accent-400  Light Orange (hover)
█ #FF7518  accent-500  Bright Orange (active)
█ #E85D00  accent-600  PRIMARY ACCENT - CTAs, peaks
█ #CC4500  accent-700  Deep Orange
```

**Usage:**
- Generate buttons
- Audio waveform peaks
- Important CTAs
- Progress indicators

### Secondary: Studio Teal

Fresh teal for success states and completed actions.

```
█ #5EEAD4  secondary-400  Light Teal
█ #2DD4BF  secondary-500  Bright Teal
█ #14B8A6  secondary-600  PRIMARY SECONDARY - Success
█ #0D7377  secondary-700  Deep Teal
```

**Usage:**
- Success messages
- Completed audio cards
- Checkmarks, confirmations
- Positive feedback

### Neutrals: Concrete & Carbon

Sophisticated gray scale optimized for both light and dark modes.

```
Light Mode:
█ #F8F9FB  neutral-50   Nearly White
█ #EDF0F7  neutral-100  Off White (canvas bg)
█ #D5DBEB  neutral-200  Very Light Gray
█ #B0B9C8  neutral-300  Pale Gray (placeholders)
█ #8A96A8  neutral-400  Light Gray
█ #6B7788  neutral-500  Mid Gray (secondary text)
█ #4F5B6D  neutral-600  Gray (primary text light mode)

Dark Mode:
█ #3A4252  neutral-700  Medium Gray
█ #2A313D  neutral-800  Dark Gray (card bg)
█ #1A1F28  neutral-900  Carbon (UI elements)
█ #0A0E14  neutral-950  Pure Black (canvas bg dark)
```

### Semantic Colors

```
█ #14B8A6  Success (Teal)
█ #F59E0B  Warning (Amber)
█ #EF4444  Error (Red)
█ #3B82F6  Info (Blue)
```

---

## Typography Scale

**Font Family:**
- Interface: Inter Variable
- Code/Technical: JetBrains Mono

**Scale:**

```
HERO TEXT (text-4xl)
36px / 2.25rem - Hero sections

PAGE HEADERS (text-3xl)
30px / 1.875rem - Page titles

SECTION HEADERS (text-2xl)
24px / 1.5rem - Canvas title, section headers

CARD TITLES (text-xl)
20px / 1.25rem - Card headers

LARGE BODY (text-lg)
18px / 1.125rem - Emphasized text

BODY TEXT (text-base)
16px / 1rem - Default text, inputs

BODY SMALL (text-sm)
14px / 0.875rem - Secondary text, buttons

CAPTIONS/LABELS (text-xs)
12px / 0.75rem - Form labels, metadata
```

**Weights:**
- Regular (400): Body text
- Medium (500): Emphasized text
- Semibold (600): Headings, buttons
- Bold (700): Strong emphasis

---

## Component States

### Button States

**Primary Button:**
```
Default:  bg-primary-600, text-white
Hover:    bg-primary-700, shadow-lg, translateY(-1px)
Active:   bg-primary-800, shadow-md, translateY(0)
Focus:    ring-2 ring-primary-600 ring-offset-2
Disabled: opacity-60, cursor-not-allowed
Loading:  spinner + disabled state
```

**Accent Button:**
```
Default:  bg-accent-600, text-white
Hover:    bg-accent-700, shadow-lg, translateY(-1px)
Active:   bg-accent-800, shadow-md, translateY(0)
```

**Secondary Button:**
```
Default:  bg-transparent, border-2 border-primary-600, text-primary-600
Hover:    bg-primary-50 (light), bg-primary-950 (dark)
Active:   bg-primary-100 (light), bg-primary-900 (dark)
```

**Ghost Button:**
```
Default:  bg-transparent, text-neutral-600
Hover:    bg-neutral-100, text-primary-600
Active:   bg-neutral-200
```

### Input States

**Text Input:**
```
Default:  border-2 border-neutral-200, bg-white
Focus:    border-primary-600, ring-3 ring-primary-100/50
Error:    border-red-600, red error text below
Disabled: bg-neutral-100, opacity-60
```

### Card States

**Prompt Card:**
```
Default:   border-2 border-neutral-200, shadow-card
Hover:     border-primary-300, shadow-card-hover, scale-101
Selected:  border-3 border-primary-600, shadow-card-selected
Dragging:  opacity-85, shadow-card-dragging, cursor-grabbing
Error:     border-red-600, error message in footer
```

**Audio Card:**
```
Default:   border-2 border-secondary-600 (generated state)
Playing:   pulsing waveform, accent-600 progress indicator
Paused:    static waveform, neutral progress
```

---

## Layout Measurements

### Toolbar Heights
```
Top Toolbar:     64px
Bottom Toolbar:  48px
```

### Panel Widths
```
Left Panel:
  Collapsed: 64px
  Expanded:  280px

Right Inspector: 320px
```

### Card Constraints
```
Prompt Card:
  Min Width:  400px
  Max Width:  600px
  Min Height: 240px (auto-expand)

Audio Card:
  Min Width:  400px
  Max Width:  400px (fixed)
  Height:     auto

Compare Card:
  Min Width:  600px
  Max Width:  600px
  Height:     auto

Note Card:
  Min Width:  200px
  Max Width:  300px
  Min Height: 120px
```

### Spacing
```
Card Padding:    24px (space-6)
Card Gap:        32px (space-8) minimum
Section Spacing: 48px (space-12)
Input Padding:   12px 16px (space-3 space-4)
Button Padding:  12px 24px (space-3 space-6)
```

---

## Shadows

```css
/* Card Shadows */
shadow-card:          0 2px 8px rgba(0,0,0,0.08)
shadow-card-hover:    0 4px 16px rgba(0,0,0,0.12)
shadow-card-selected: 0 8px 24px rgba(26,107,160,0.24)
shadow-card-dragging: 0 12px 32px rgba(0,0,0,0.24)

/* UI Shadows */
shadow-sm:  0 1px 2px rgba(0,0,0,0.05)
shadow-md:  0 4px 6px rgba(0,0,0,0.1)
shadow-lg:  0 10px 15px rgba(0,0,0,0.1)
shadow-xl:  0 20px 25px rgba(0,0,0,0.1)
```

**Dark Mode:**
Use glow instead of shadow on cards:
```css
box-shadow: 0 0 0 1px rgba(primary, 0.2), 0 4px 16px rgba(primary, 0.1)
```

---

## Animations

### Timing Functions
```css
ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)
ease-out:     cubic-bezier(0, 0, 0.2, 1)
ease-in:      cubic-bezier(0.4, 0, 1, 1)
ease-bounce:  cubic-bezier(0.68, -0.55, 0.265, 1.55)
ease-smooth:  cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

### Durations
```css
duration-fast:   150ms   /* Quick interactions (hover, click) */
duration-normal: 250ms   /* Default transitions */
duration-slow:   400ms   /* Complex animations (card appear) */
```

### Common Animations

**Card Appear:**
```
from: { opacity: 0, scale: 0.9, y: 20 }
to:   { opacity: 1, scale: 1, y: 0 }
duration: 400ms, easing: ease-bounce
```

**Button Hover:**
```
to: { translateY: -1px, shadow: lg }
duration: 150ms, easing: ease-out
```

**Loading Spinner:**
```
rotate: 0deg → 360deg
duration: 1s, easing: linear, iterations: infinite
```

---

## Border Radius

```
rounded-sm:   4px  (small elements)
rounded:      6px  (buttons, inputs small)
rounded-lg:   8px  (inputs, dropdowns)
rounded-xl:   12px (cards)
rounded-2xl:  16px (large containers)
rounded-full: 50%  (avatars, icon buttons)
```

---

## Breakpoints

```
Mobile Portrait:   < 640px  (xs)
Mobile Landscape:  640px+   (sm)
Tablet:            768px+   (md)
Laptop:            1024px+  (lg)
Desktop:           1280px+  (xl)
Large Desktop:     1536px+  (2xl)
```

**Canvas Layout:**
- Desktop (≥1024px): Full canvas with all panels
- Tablet (768-1023px): Compact toolbar, overlay inspector
- Mobile (<768px): Vertical stack, no infinite canvas

---

## Accessibility

### Focus Indicators

All interactive elements must have visible focus:
```css
focus:outline-none
focus-visible:ring-2 focus-visible:ring-primary-600
focus-visible:ring-offset-2
```

### Minimum Sizes
- Touch targets: 44x44px minimum (mobile)
- Click targets: 32x32px minimum (desktop)
- Text inputs: 48px height (mobile), 40px (desktop)

### Color Contrast (WCAG AA)

✅ **Passing Combinations:**
- primary-600 on white: 7.2:1
- neutral-600 on neutral-50: 5.8:1
- accent-600 on white: 4.9:1
- neutral-50 on neutral-950: 19.1:1

❌ **Failing Combinations (avoid):**
- primary-300 on white: 2.1:1 (too light)
- neutral-400 on white: 3.2:1 (below 4.5:1)

---

## Icon System

**Recommended Icon Libraries:**
- Lucide React (primary)
- Heroicons (alternative)

**Icon Sizes:**
```
w-3 h-3  (12px) - Small indicators, inline
w-4 h-4  (16px) - Buttons, inline text
w-5 h-5  (20px) - Toolbar icons
w-6 h-6  (24px) - Card headers
w-8 h-8  (32px) - Large actions
```

**Stroke Width:**
- Default: 2px
- Thin: 1.5px (large icons)
- Bold: 2.5px (emphasis)

---

## Common Patterns

### Empty State
```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  <svg className="w-16 h-16 text-neutral-300 mb-4">
    {/* Empty icon */}
  </svg>
  <h3 className="text-xl font-semibold text-neutral-700 mb-2">
    No cards yet
  </h3>
  <p className="text-neutral-500 mb-6">
    Click '+' to create your first prompt
  </p>
  <Button variant="primary">Add Prompt Card</Button>
</div>
```

### Loading State
```tsx
<div className="flex items-center gap-3">
  <svg className="animate-spin w-5 h-5 text-primary-600">
    {/* Spinner */}
  </svg>
  <span className="text-neutral-600">Generating audio...</span>
</div>
```

### Error State
```tsx
<div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
  <svg className="w-5 h-5 text-red-600">
    {/* Error icon */}
  </svg>
  <p className="text-sm text-red-700">
    Audio generation failed. Please try again.
  </p>
</div>
```

### Success State
```tsx
<div className="flex items-center gap-2 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
  <svg className="w-5 h-5 text-secondary-600">
    {/* Check icon */}
  </svg>
  <p className="text-sm text-secondary-700">
    Audio generated successfully!
  </p>
</div>
```

---

## Code Snippets

### Tailwind Class Patterns

**Card Container:**
```tsx
className={clsx(
  'bg-white dark:bg-neutral-800',
  'border-2 rounded-xl',
  'p-6 gap-4',
  'transition-all duration-200',
  selected
    ? 'border-primary-600 shadow-card-selected'
    : 'border-neutral-200 dark:border-neutral-700 shadow-card',
  'hover:border-primary-300 hover:shadow-card-hover'
)}
```

**Input Field:**
```tsx
className={clsx(
  'w-full px-4 py-3',
  'text-base rounded-lg',
  'bg-white dark:bg-neutral-900',
  'border-2 transition-all',
  error
    ? 'border-red-600'
    : 'border-neutral-200 dark:border-neutral-700',
  'focus:border-primary-600 focus:ring-3 focus:ring-primary-100/50'
)}
```

**Button Base:**
```tsx
className={clsx(
  'inline-flex items-center justify-center',
  'px-6 py-3 gap-2',
  'font-semibold rounded-lg',
  'transition-all duration-150',
  'focus:outline-none focus-visible:ring-2',
  'disabled:opacity-60 disabled:cursor-not-allowed'
)}
```

---

## Design Checklist

Before shipping a component:

- [ ] All interactive states defined (default, hover, active, focus, disabled)
- [ ] Dark mode classes added (dark:)
- [ ] Proper ARIA labels and roles
- [ ] Keyboard navigation tested
- [ ] Color contrast checked (WCAG AA)
- [ ] Responsive behavior defined
- [ ] Loading/error states implemented
- [ ] Animations respect prefers-reduced-motion
- [ ] Focus indicators visible
- [ ] Touch targets ≥44px on mobile

---

**Version**: 1.0
**Last Updated**: 2026-01-08

Quick reference for aimake.cc Infinity Canvas design system.
