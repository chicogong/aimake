/**
 * Input Component
 * Accessible text input with variants and states
 *
 * Usage:
 * <Input
 *   label="Canvas Name"
 *   placeholder="Enter canvas name..."
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 */

import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Input Component
 * @see Design System: Section 7 - Form Inputs
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={clsx('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'text-xs font-medium uppercase tracking-wide',
              hasError ? 'text-red-600' : 'text-neutral-500 dark:text-neutral-400'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={clsx(
              // Base
              'w-full px-4 py-3',
              'text-base text-neutral-900 dark:text-neutral-50',
              'bg-white dark:bg-neutral-900',
              'rounded-lg',
              'transition-all duration-150',

              // Border & Focus
              hasError
                ? 'border-2 border-red-600'
                : 'border-2 border-neutral-200 dark:border-neutral-700',

              !hasError && 'focus:border-primary-600 focus:outline-none',
              !hasError && 'focus:ring-3 focus:ring-primary-100/50 dark:focus:ring-primary-900/50',

              // Disabled
              disabled && 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-60',

              // Icons
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',

              // Placeholder
              'placeholder:text-neutral-300 dark:placeholder:text-neutral-600',

              className
            )}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 * Multi-line text input
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      autoResize = false,
      disabled,
      className,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    return (
      <div className={clsx('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className={clsx(
              'text-xs font-medium uppercase tracking-wide',
              hasError ? 'text-red-600' : 'text-neutral-500 dark:text-neutral-400'
            )}
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          onChange={handleChange}
          className={clsx(
            // Base
            'w-full px-4 py-3',
            'text-base text-neutral-900 dark:text-neutral-50',
            'bg-white dark:bg-neutral-900',
            'rounded-lg',
            'transition-all duration-150',
            'resize-none',

            // Border & Focus
            hasError
              ? 'border-2 border-red-600'
              : 'border-2 border-neutral-200 dark:border-neutral-700',

            !hasError && 'focus:border-primary-600 focus:outline-none',
            !hasError && 'focus:ring-3 focus:ring-primary-100/50 dark:focus:ring-primary-900/50',

            // Disabled
            disabled && 'bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed opacity-60',

            // Placeholder
            'placeholder:text-neutral-300 dark:placeholder:text-neutral-600',

            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={`${textareaId}-helper`}
            className="text-sm text-neutral-500 dark:text-neutral-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Example usage
export const InputExample = () => {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-md">
      <Input
        label="Canvas Name"
        placeholder="Enter canvas name..."
        helperText="This will be visible to collaborators"
      />

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        }
      />

      <Input
        label="Search"
        placeholder="Search cards..."
        rightIcon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />

      <Input
        label="Error State"
        placeholder="Invalid input"
        error="This field is required"
      />

      <Input
        label="Disabled"
        placeholder="Disabled input"
        disabled
      />

      <Textarea
        label="Prompt"
        placeholder="Enter your text prompt here..."
        rows={4}
        helperText="Supports up to 1000 characters"
      />

      <Textarea
        label="Auto-resize"
        placeholder="Type to expand..."
        autoResize
        rows={2}
      />
    </div>
  );
};
