/**
 * Button — IA-Retro-Glassmorphism design system
 *
 * Variants:
 *   primary   — IA-orange fill, neon-orange glow on hover
 *   secondary — glass / frosted, cyan accent border
 *   ghost     — transparent, subtle hover
 *   danger    — rose/red fill for destructive actions
 *   neon      — dark bg + neon-orange outline glow (retro CRT style)
 *
 * Sizes: xs | sm | md | lg | icon
 * Supports loading state, disabled, and full-width.
 */

import { type HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

// ── Style maps ────────────────────────────────────────────────────────────────
const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-ia-500 text-white',
    'border border-ia-400',
    'hover:bg-ia-400 hover:shadow-neon-orange hover:border-ia-300',
    'active:bg-ia-600',
    'focus-visible:ring-ia-400',
    'disabled:bg-ia-800 disabled:text-ia-300 disabled:border-ia-700',
  ].join(' '),

  secondary: [
    'backdrop-blur-xl bg-white/10 dark:bg-white/5',
    'border border-white/20 dark:border-white/10',
    'text-gray-900 dark:text-white',
    'hover:bg-white/20 dark:hover:bg-white/10',
    'hover:border-ia-400/60 hover:shadow-neon-orange',
    'focus-visible:ring-accent-500',
    'disabled:opacity-40',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'border border-transparent',
    'text-gray-700 dark:text-gray-300',
    'hover:bg-white/10 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white',
    'focus-visible:ring-accent-500',
    'disabled:opacity-40',
  ].join(' '),

  danger: [
    'bg-rose-600 text-white',
    'border border-rose-500',
    'hover:bg-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.4),0_0_40px_rgba(244,63,94,0.2)]',
    'active:bg-rose-700',
    'focus-visible:ring-rose-400',
    'disabled:bg-rose-900 disabled:text-rose-300',
  ].join(' '),

  neon: [
    'bg-gray-950 dark:bg-black text-ia-400',
    'border-2 border-ia-500/70',
    'shadow-neon-orange',
    'hover:border-ia-400 hover:text-ia-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.6),0_0_60px_rgba(249,115,22,0.3)]',
    'font-mono tracking-wide',
    'focus-visible:ring-ia-400',
    'disabled:opacity-40',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
  icon: 'h-10 w-10 p-0 rounded-xl',
};

// ── Framer Motion tap / hover ─────────────────────────────────────────────────
const buttonTap = { scale: 0.96 };
const buttonHover = { scale: 1.02 };
const buttonTransition = { type: 'spring', stiffness: 400, damping: 20 } as const;

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <motion.span
    className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 0.7, ease: 'linear', repeat: Infinity }}
    aria-hidden="true"
  />
);

// ── Component ─────────────────────────────────────────────────────────────────
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className = '',
      children,
      disabled,
      ...motionProps
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const classes = [
      // Base
      'inline-flex items-center justify-center font-medium',
      'min-h-[24px] min-w-[24px] box-border',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-[3px] dark:focus-visible:ring-offset-gray-900',
      'disabled:cursor-not-allowed',
      'select-none',
      // Variant + size
      variantStyles[variant],
      sizeStyles[size],
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <motion.button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : buttonTap}
        whileHover={isDisabled ? undefined : buttonHover}
        transition={buttonTransition}
        {...motionProps}
      >
        {loading ? (
          <>
            <Spinner />
            {children && <span className="ml-1">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  },
);
Button.displayName = 'Button';

// ── Icon-only convenience ─────────────────────────────────────────────────────
export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'size' | 'leftIcon' | 'rightIcon' | 'fullWidth'>
>((props, ref) => <Button ref={ref} size="icon" {...props} />);
IconButton.displayName = 'IconButton';
