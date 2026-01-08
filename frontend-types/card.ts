/**
 * Card Type Definitions
 * Core interfaces for Infinity Canvas cards
 */

export type CardType = 'prompt' | 'audio' | 'compare' | 'note';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseCard {
  id: string;
  type: CardType;
  position: Position;
  size: Size;
  createdAt: Date;
  updatedAt: Date;
  selected: boolean;
  zIndex: number;
}

export interface PromptCard extends BaseCard {
  type: 'prompt';
  title: string;
  content: string;
  settings: {
    voice: string;
    speed: number; // 0.5 - 2.0
    pitch?: number;
    language?: string;
  };
  status: 'idle' | 'generating' | 'completed' | 'error';
  linkedAudioId?: string;
}

export interface AudioCard extends BaseCard {
  type: 'audio';
  content: {
    audioUrl: string;
    duration: number; // seconds
    waveform: number[]; // Amplitude data (0-1), typically 100-200 samples
    format: 'mp3' | 'wav';
    fileSize: number; // bytes
  };
  metadata: {
    generationTime: number; // ms - inference latency
    rtf: number; // Real-Time Factor (lower is better)
    promptId: string; // Link to source prompt card
    promptText: string; // Preview of source text
  };
  status: 'loading' | 'ready' | 'playing' | 'error';
}

export interface CompareCard extends BaseCard {
  type: 'compare';
  title: string;
  audioAId: string;
  audioBId: string;
  settingsA: PromptCard['settings'];
  settingsB: PromptCard['settings'];
  verdict?: 'A' | 'B' | null;
}

export interface NoteCard extends BaseCard {
  type: 'note';
  title: string;
  content: string;
  color: 'yellow' | 'blue' | 'green' | 'pink';
}

export type Card = PromptCard | AudioCard | CompareCard | NoteCard;

// Card creation payloads (without auto-generated fields)
export type CreatePromptCard = Omit<
  PromptCard,
  'id' | 'createdAt' | 'updatedAt' | 'selected' | 'zIndex' | 'status' | 'linkedAudioId'
>;

export type CreateAudioCard = Omit<
  AudioCard,
  'id' | 'createdAt' | 'updatedAt' | 'selected' | 'zIndex' | 'status'
>;

export type CreateCompareCard = Omit<
  CompareCard,
  'id' | 'createdAt' | 'updatedAt' | 'selected' | 'zIndex' | 'verdict'
>;

export type CreateNoteCard = Omit<
  NoteCard,
  'id' | 'createdAt' | 'updatedAt' | 'selected' | 'zIndex'
>;

// Canvas interactions
export interface CardDragEvent {
  cardId: string;
  position: Position;
}

export interface CardResizeEvent {
  cardId: string;
  size: Size;
}

export interface CardSelectEvent {
  cardId: string;
  multiSelect: boolean; // Cmd/Ctrl held
}

export interface CardContextMenuEvent {
  cardId: string;
  position: Position;
}
