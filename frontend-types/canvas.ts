/**
 * Canvas Type Definitions
 * State management for Infinity Canvas
 */

import type { Card, Position } from './card';

export interface Viewport {
  x: number;
  y: number;
  scale: number; // zoom level (0.1 - 3.0)
}

export interface CanvasState {
  // Canvas metadata
  id: string;
  name: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;

  // Cards
  cards: Card[];
  selectedCardIds: string[];

  // Viewport
  viewport: Viewport;

  // UI state
  isDragging: boolean;
  isPanning: boolean;
  isSelecting: boolean;

  // History (undo/redo)
  history: CanvasSnapshot[];
  historyIndex: number;
}

export interface CanvasSnapshot {
  cards: Card[];
  timestamp: Date;
}

export interface CanvasActions {
  // Card CRUD
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => void;

  // Selection
  selectCard: (id: string, multiSelect?: boolean) => void;
  deselectCard: (id: string) => void;
  deselectAll: () => void;

  // Viewport
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;

  // History
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;

  // Bulk operations
  deleteSelected: () => void;
  alignCards: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeCards: (direction: 'horizontal' | 'vertical') => void;
}

export type CanvasStore = CanvasState & CanvasActions;

// Canvas settings
export interface CanvasSettings {
  // Grid
  showGrid: boolean;
  gridSize: number; // px
  snapToGrid: boolean;

  // Appearance
  theme: 'light' | 'dark' | 'system';
  backgroundColor: string;

  // Interaction
  enableMinimap: boolean;
  enableKeyboardShortcuts: boolean;
  panWithSpacebar: boolean;

  // Performance
  renderOnlyVisible: boolean;
  cacheCards: boolean;
  maxHistorySize: number;
}

// Export format
export interface CanvasExport {
  version: string;
  canvas: Omit<CanvasState, 'selectedCardIds' | 'isDragging' | 'isPanning' | 'isSelecting' | 'history' | 'historyIndex'>;
  settings: CanvasSettings;
  exportedAt: Date;
}
