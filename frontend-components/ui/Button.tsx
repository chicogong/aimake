/**
 * Button Component
 * Accessible button with variants and states
 *
 * Usage:
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Generate Audio
 * </Button>
 */

import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

/**
 * Button Component
 * @see Design System: Section 7 - Component Library
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = clsx(
      // Base
      'inline-flex items-center justify-center',
      'font-semibold rounded-lg',
      'transition-all duration-150 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',

      // Full width
      fullWidth && 'w-full',

      // Sizes
      {
        'text-sm px-4 py-2 gap-2': size === 'sm',
        'text-sm px-6 py-3 gap-2': size === 'md',
        'text-base px-8 py-4 gap-3': size === 'lg',
      },

      // Variants
      {
        // Primary
        'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md':
          variant === 'primary' && !disabled,

        // Accent
        'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md':
          variant === 'accent' && !disabled,

        // Secondary
        'bg-transparent text-primary-600 border-2 border-primary-600':
          variant === 'secondary' && !disabled,
        'hover:bg-primary-50 active:bg-primary-100':
          variant === 'secondary' && !disabled,
        'dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-950':
          variant === 'secondary' && !disabled,

        // Ghost
        'bg-transparent text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200':
          variant === 'ghost' && !disabled,
        'dark:text-neutral-400 dark:hover:bg-neutral-800 dark:active:bg-neutral-700':
          variant === 'ghost' && !disabled,

        // Danger
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md':
          variant === 'danger' && !disabled,
      }
    );

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(baseStyles, className)}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && icon && iconPosition === 'left' && (
          <span aria-hidden="true">{icon}</span>
        )}

        {children}

        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

/**
 * Icon Button Component
 * Square button with only an icon
 */
export interface IconButtonProps extends Omit<ButtonProps, 'iconPosition' | 'children'> {
  icon: React.ReactNode;
  label: string; // Required for accessibility
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        className={clsx(
          'inline-flex items-center justify-center',
          'rounded-lg',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Example usage
export const ButtonExample = () => {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex gap-4 items-center">
        <Button variant="primary" size="sm">Small Primary</Button>
        <Button variant="primary" size="md">Medium Primary</Button>
        <Button variant="primary" size="lg">Large Primary</Button>
      </div>

      <div className="flex gap-4 items-center">
        <Button variant="accent">Generate Audio</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Reset</Button>
        <Button variant="danger">Delete</Button>
      </div>

      <div className="flex gap-4 items-center">
        <Button variant="primary" loading>Generating...</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>

      <div className="flex gap-4 items-center">
        <Button
          variant="primary"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        >
          Add Card
        </Button>

        <Button
          variant="secondary"
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>}
          iconPosition="left"
        >
          Back
        </Button>
      </div>
    </div>
  );
};
