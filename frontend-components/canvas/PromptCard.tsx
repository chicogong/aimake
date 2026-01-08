/**
 * Prompt Card Component
 * Input card for text prompts and TTS settings
 *
 * Usage:
 * <PromptCard
 *   card={promptCardData}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 *   onGenerate={handleGenerate}
 * />
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import type { PromptCard as PromptCardType } from '../../frontend-types/card';

export interface PromptCardProps {
  card: PromptCardType;
  onUpdate: (id: string, updates: Partial<PromptCardType>) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

/**
 * Prompt Card Component
 * @see Design System: Section 6 - Card Types
 */
export const PromptCard: React.FC<PromptCardProps> = ({
  card,
  onUpdate,
  onDelete,
  onGenerate,
  selected = false,
  onSelect,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleContentChange = (content: string) => {
    onUpdate(card.id, { content });
  };

  const handleTitleChange = (title: string) => {
    onUpdate(card.id, { title });
  };

  const handleSettingsChange = (settings: Partial<PromptCardType['settings']>) => {
    onUpdate(card.id, {
      settings: { ...card.settings, ...settings },
    });
  };

  const isGenerating = card.status === 'generating';
  const isCompleted = card.status === 'completed';
  const hasError = card.status === 'error';

  return (
    <div
      onClick={() => onSelect?.(card.id)}
      className={clsx(
        // Base card styling
        'flex flex-col',
        'bg-white dark:bg-neutral-800',
        'rounded-xl',
        'transition-all duration-200',
        'cursor-move',

        // Width constraints
        'min-w-[400px] max-w-[600px]',

        // Borders & Shadows
        selected
          ? 'border-3 border-primary-600 shadow-card-selected'
          : 'border-2 border-neutral-200 dark:border-neutral-700 shadow-card',

        // Hover state (not when selected)
        !selected && 'hover:border-primary-300 hover:shadow-card-hover hover:scale-[1.01]',

        // Error state
        hasError && 'border-red-600',

        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-lg',
              'bg-primary-100 dark:bg-primary-900/30',
              hasError && 'bg-red-100 dark:bg-red-900/30'
            )}
          >
            <svg
              className={clsx(
                'w-5 h-5',
                hasError ? 'text-red-600' : 'text-primary-600 dark:text-primary-400'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          {/* Title */}
          <input
            type="text"
            value={card.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={clsx(
              'flex-1 text-xl font-semibold',
              'bg-transparent outline-none',
              'text-neutral-900 dark:text-neutral-50',
              'placeholder:text-neutral-300 dark:placeholder:text-neutral-600'
            )}
            placeholder="Prompt title..."
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Settings Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={clsx(
              'p-2 rounded-lg',
              'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200',
              'hover:bg-neutral-100 dark:hover:bg-neutral-700',
              'transition-colors'
            )}
            aria-label="Toggle settings"
          >
            <svg
              className={clsx('w-5 h-5 transition-transform', isExpanded && 'rotate-90')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(card.id);
            }}
            className={clsx(
              'p-2 rounded-lg',
              'text-neutral-400 hover:text-red-600',
              'hover:bg-red-50 dark:hover:bg-red-900/20',
              'transition-colors'
            )}
            aria-label="Delete card"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <Textarea
          value={card.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter your text prompt here..."
          rows={6}
          autoResize
          fullWidth
          onClick={(e) => e.stopPropagation()}
          className="text-base"
        />

        {/* Character count */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-neutral-400">
            {card.content.length} / 1000 characters
          </span>
          {card.content.length > 900 && (
            <span className="text-xs text-amber-600">
              {1000 - card.content.length} remaining
            </span>
          )}
        </div>
      </div>

      {/* Settings Panel (Expandable) */}
      {isExpanded && (
        <div className="px-6 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <div className="space-y-4">
            {/* Voice Selector */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                Voice
              </label>
              <select
                value={card.settings.voice}
                onChange={(e) => handleSettingsChange({ voice: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className={clsx(
                  'w-full px-4 py-2 text-sm',
                  'bg-white dark:bg-neutral-900',
                  'border-2 border-neutral-200 dark:border-neutral-700',
                  'rounded-lg',
                  'focus:border-primary-600 focus:outline-none',
                  'text-neutral-900 dark:text-neutral-50'
                )}
              >
                <option value="default">Default</option>
                <option value="male">Male Voice</option>
                <option value="female">Female Voice</option>
                <option value="neutral">Neutral Voice</option>
              </select>
            </div>

            {/* Speed Slider */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">
                Speed: {card.settings.speed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={card.settings.speed}
                onChange={(e) => handleSettingsChange({ speed: parseFloat(e.target.value) })}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer: Generate Button */}
      <div className="px-6 pb-6">
        <Button
          variant="accent"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            onGenerate(card.id);
          }}
          disabled={!card.content.trim() || isGenerating}
          loading={isGenerating}
        >
          {isGenerating ? (
            'Generating...'
          ) : isCompleted ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Regenerate Audio
            </>
          ) : hasError ? (
            'Retry Generation'
          ) : (
            'Generate Audio'
          )}
        </Button>

        {hasError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Generation failed. Please try again.
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="px-6 pb-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>
            Created {new Date(card.createdAt).toLocaleDateString()}
          </span>
          {card.linkedAudioId && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Linked to audio
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Example usage with mock data
export const PromptCardExample = () => {
  const [card, setCard] = useState<PromptCardType>({
    id: '1',
    type: 'prompt',
    title: 'Product Demo Script',
    content: 'Welcome to aimake.cc, the professional AI TTS platform for creators.',
    position: { x: 0, y: 0 },
    size: { width: 500, height: 400 },
    settings: {
      voice: 'default',
      speed: 1.0,
    },
    status: 'idle',
    createdAt: new Date(),
    updatedAt: new Date(),
    selected: false,
    zIndex: 1,
  });

  return (
    <div className="p-8 bg-neutral-100 dark:bg-neutral-950 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Prompt Card Examples
        </h1>

        {/* Default State */}
        <PromptCard
          card={card}
          onUpdate={(id, updates) =>
            setCard((prev) => ({ ...prev, ...updates }))
          }
          onDelete={(id) => console.log('Delete:', id)}
          onGenerate={(id) => {
            console.log('Generate:', id);
            setCard((prev) => ({ ...prev, status: 'generating' }));
            setTimeout(() => {
              setCard((prev) => ({ ...prev, status: 'completed' }));
            }, 2000);
          }}
        />

        {/* Selected State */}
        <PromptCard
          card={{ ...card, id: '2', title: 'Selected Card' }}
          selected={true}
          onUpdate={(id, updates) => console.log('Update:', id, updates)}
          onDelete={(id) => console.log('Delete:', id)}
          onGenerate={(id) => console.log('Generate:', id)}
        />

        {/* Error State */}
        <PromptCard
          card={{
            ...card,
            id: '3',
            title: 'Error Card',
            status: 'error',
          }}
          onUpdate={(id, updates) => console.log('Update:', id, updates)}
          onDelete={(id) => console.log('Delete:', id)}
          onGenerate={(id) => console.log('Generate:', id)}
        />
      </div>
    </div>
  );
};
