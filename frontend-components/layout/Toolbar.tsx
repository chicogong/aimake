/**
 * Top Toolbar Component
 * Main navigation and canvas controls
 *
 * Usage:
 * <TopToolbar
 *   canvasName="My Canvas"
 *   onCanvasNameChange={setCanvasName}
 *   onShare={handleShare}
 * />
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button, IconButton } from '../ui/Button';

export interface TopToolbarProps {
  canvasName: string;
  onCanvasNameChange: (name: string) => void;
  onShare?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

/**
 * Top Toolbar Component
 * @see Design System: Section 7 - Toolbar Components
 */
export const TopToolbar: React.FC<TopToolbarProps> = ({
  canvasName,
  onCanvasNameChange,
  onShare,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(canvasName);

  const handleNameSave = () => {
    if (editedName.trim()) {
      onCanvasNameChange(editedName.trim());
    } else {
      setEditedName(canvasName);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditedName(canvasName);
      setIsEditingName(false);
    }
  };

  return (
    <header
      className={clsx(
        'h-16 flex items-center justify-between px-6 gap-4',
        'bg-white dark:bg-neutral-900',
        'border-b border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Left Section: Logo + Canvas Name */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="aimake.cc home"
        >
          <svg
            className="w-8 h-8 text-primary-600"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simple waveform icon */}
            <path
              d="M4 16h4l2-8 4 16 4-12 2 8h4"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold text-primary-900 dark:text-neutral-50">
            aimake
          </span>
        </a>

        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

        {/* Canvas Name */}
        {isEditingName ? (
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className={clsx(
              'px-3 py-1.5 text-xl font-semibold',
              'bg-neutral-50 dark:bg-neutral-800',
              'border-2 border-primary-600',
              'rounded-lg outline-none',
              'text-neutral-900 dark:text-neutral-50',
              'max-w-md'
            )}
            aria-label="Edit canvas name"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className={clsx(
              'px-3 py-1.5 text-xl font-semibold',
              'text-neutral-900 dark:text-neutral-50',
              'hover:bg-neutral-50 dark:hover:bg-neutral-800',
              'rounded-lg transition-colors',
              'text-left truncate max-w-md'
            )}
            aria-label="Canvas name (click to edit)"
          >
            {canvasName}
          </button>
        )}
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <IconButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            }
            label="Undo (Cmd+Z)"
            variant="ghost"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
          />
          <IconButton
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                />
              </svg>
            }
            label="Redo (Cmd+Shift+Z)"
            variant="ghost"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
          />
        </div>

        <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

        {/* Share Button */}
        <Button variant="secondary" size="sm" onClick={onShare}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </Button>

        {/* User Menu */}
        <IconButton
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          label="User menu"
          variant="ghost"
          title="User menu"
        />
      </div>
    </header>
  );
};

/**
 * Left Panel Component
 * Tool selector for adding cards
 */
export interface LeftPanelProps {
  onAddPromptCard: () => void;
  onAddCompareCard: () => void;
  onAddNoteCard: () => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  onAddPromptCard,
  onAddCompareCard,
  onAddNoteCard,
  expanded = false,
  onToggleExpand,
  className,
}) => {
  const tools = [
    {
      id: 'prompt',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      label: 'Add Prompt',
      shortcut: 'Cmd+N',
      onClick: onAddPromptCard,
    },
    {
      id: 'compare',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      label: 'Compare',
      onClick: onAddCompareCard,
    },
    {
      id: 'note',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      ),
      label: 'Add Note',
      onClick: onAddNoteCard,
    },
  ];

  return (
    <aside
      className={clsx(
        'flex flex-col gap-2 py-4',
        'bg-neutral-50 dark:bg-neutral-900',
        'border-r border-neutral-200 dark:border-neutral-800',
        'transition-all duration-250',
        expanded ? 'w-70 px-4' : 'w-16 px-2',
        className
      )}
    >
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={tool.onClick}
          className={clsx(
            'flex items-center gap-3 p-3',
            'text-neutral-600 dark:text-neutral-400',
            'hover:bg-primary-50 dark:hover:bg-neutral-800',
            'hover:text-primary-600 dark:hover:text-primary-400',
            'rounded-lg transition-colors',
            'group'
          )}
          title={expanded ? undefined : tool.label}
        >
          <span className="flex-shrink-0">{tool.icon}</span>
          {expanded && (
            <>
              <span className="text-sm font-medium flex-1 text-left">{tool.label}</span>
              {tool.shortcut && (
                <kbd className="text-xs text-neutral-400 font-mono">{tool.shortcut}</kbd>
              )}
            </>
          )}
        </button>
      ))}
    </aside>
  );
};

/**
 * Bottom Toolbar Component
 * Zoom controls and minimap
 */
export interface BottomToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomFit: () => void;
  className?: string;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  className,
}) => {
  return (
    <footer
      className={clsx(
        'h-12 flex items-center justify-between px-6',
        'bg-white dark:bg-neutral-900',
        'border-t border-neutral-200 dark:border-neutral-800',
        className
      )}
    >
      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <IconButton
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          }
          label="Zoom out"
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
        />

        <button
          onClick={onZoomReset}
          className="px-3 py-1 text-sm font-mono text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {Math.round(zoom * 100)}%
        </button>

        <IconButton
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
          label="Zoom in"
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
        />

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800" />

        <button
          onClick={onZoomFit}
          className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          Fit to Screen
        </button>
      </div>

      {/* Minimap Placeholder */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">Minimap</span>
        <div className="w-32 h-8 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700" />
      </div>
    </footer>
  );
};
