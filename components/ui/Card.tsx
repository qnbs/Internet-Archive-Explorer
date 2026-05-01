/**
 * Card — IA-Retro-Glassmorphism design system
 *
 * Variants:
 *   glass   — frosted glass panel (default), works on any background
 *   solid   — opaque card for content-heavy surfaces
 *   retro   — VHS-era scanline aesthetic
 *   sepia   — warm parchment, auto-selected in sepia theme
 *
 * All variants feature neon-orange glow on hover unless `noHover` is set.
 */

import { type HTMLMotionProps, motion } from 'framer-motion';
import React from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
export type CardVariant = 'glass' | 'solid' | 'retro' | 'sepia';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant;
  /** Disable the neon-orange hover glow */
  noHover?: boolean;
  /** Extra padding — defaults to 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Render as <article> instead of <div> */
  as?: 'div' | 'article' | 'section' | 'li';
}

// ── Styles map ────────────────────────────────────────────────────────────────
const variantBase: Record<CardVariant, string> = {
  glass: [
    'backdrop-blur-xl',
    'bg-white/10 dark:bg-white/5',
    'border border-white/20 dark:border-white/10',
    'shadow-glass',
    // Sepia override via sibling selector on <html>
    'sepia:bg-sepia-50/80 sepia:border-sepia-200/60',
  ].join(' '),

  solid: [
    'bg-white dark:bg-gray-900',
    'border border-gray-200 dark:border-gray-700',
    'shadow-md',
    'sepia:bg-sepia-50 sepia:border-sepia-300',
  ].join(' '),

  retro: [
    'bg-gray-950 dark:bg-black',
    'border-2 border-ia-500/70',
    'shadow-neon-orange',
    'font-mono',
    // CRT scanline pseudo-element handled by CSS class
    'retro-scanlines',
  ].join(' '),

  sepia: [
    'backdrop-blur-sm',
    'bg-sepia-50/90 dark:bg-sepia-900/30',
    'border border-sepia-300/70',
    'shadow-sm',
  ].join(' '),
};

const paddingMap: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

// ── Framer Motion variants ────────────────────────────────────────────────────
const cardMotion = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: { opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.2 } },
};

// ── Component ─────────────────────────────────────────────────────────────────
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      noHover = false,
      padding = 'md',
      as: Tag = 'div',
      className = '',
      children,
      ...motionProps
    },
    ref,
  ) => {
    const hoverClasses = noHover
      ? ''
      : [
          'transition-all duration-300 ease-out',
          'hover:shadow-neon-orange',
          'hover:border-ia-400/50 dark:hover:border-ia-400/40',
          'hover:-translate-y-0.5',
        ].join(' ');

    const classes = [
      'rounded-xl overflow-hidden',
      variantBase[variant],
      paddingMap[padding],
      hoverClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const MotionTag = motion[Tag as 'div'];

    return (
      <MotionTag
        ref={ref as React.Ref<HTMLDivElement>}
        className={classes}
        variants={cardMotion}
        initial="initial"
        animate="animate"
        exit="exit"
        {...motionProps}
      >
        {children}
      </MotionTag>
    );
  },
);
Card.displayName = 'Card';

// ── Sub-components ────────────────────────────────────────────────────────────
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`px-5 pt-5 pb-3 border-b border-white/10 dark:border-white/5 ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div
    className={`px-5 py-3 pt-3 border-t border-white/10 dark:border-white/5 flex items-center justify-end gap-2 ${className}`}
    {...props}
  >
    {children}
  </div>
);
