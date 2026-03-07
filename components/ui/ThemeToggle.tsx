/**
 * ThemeToggle — compact 3-cycle button for the header.
 * Cycles: light → dark → sepia → system → light …
 *
 * Also works as a "theme pill" that shows current theme with animated icon swap.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { themeAtom } from '@/store/settings';
import type { Theme } from '@/types';

// ── Icons (inline to avoid bundle deps) ──────────────────────────────────────
const SunIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SepiaIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SystemIcon: React.FC = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
  </svg>
);

// ── Theme cycle order ─────────────────────────────────────────────────────────
const CYCLE: Theme[] = ['light', 'dark', 'sepia', 'system'];

const THEME_META: Record<Theme, { label: string; icon: React.ReactNode; ringColor: string }> = {
  light:  { label: 'Light',  icon: <SunIcon />,    ringColor: 'ring-yellow-400' },
  dark:   { label: 'Dark',   icon: <MoonIcon />,   ringColor: 'ring-indigo-400' },
  sepia:  { label: 'Sepia',  icon: <SepiaIcon />,  ringColor: 'ring-sepia-500'  },
  system: { label: 'System', icon: <SystemIcon />, ringColor: 'ring-gray-400'   },
};

// ── Icon transition ───────────────────────────────────────────────────────────
const iconVariants = {
  enter:  { opacity: 0, rotate: -30, scale: 0.6 },
  center: { opacity: 1, rotate: 0,   scale: 1,   transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit:   { opacity: 0, rotate:  30, scale: 0.6, transition: { duration: 0.15 } },
};

// ── Component ─────────────────────────────────────────────────────────────────
interface ThemeToggleProps {
  /** Show text label next to icon */
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = false, className = '' }) => {
  const [theme, setTheme] = useAtom(themeAtom);

  const advance = () => {
    const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
    setTheme(next);
  };

  const meta = THEME_META[theme];

  return (
    <motion.button
      onClick={advance}
      className={[
        'relative inline-flex items-center gap-1.5',
        'h-10 px-3 rounded-xl',
        // Glass base — matches header style
        'backdrop-blur-xl bg-white/10 dark:bg-white/5',
        'border border-white/20 dark:border-white/10',
        'text-gray-700 dark:text-gray-200',
        // Hover neon-orange glow
        'hover:border-ia-400/50 hover:shadow-neon-orange hover:text-ia-400',
        'transition-all duration-200 ease-out',
        // Focus ring dynamically coloured per theme
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        `focus-visible:${meta.ringColor}`,
        className,
      ].join(' ')}
      whileTap={{ scale: 0.93 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      aria-label={`Switch theme — currently ${meta.label}`}
      title={`Theme: ${meta.label} (click to cycle)`}
    >
      {/* Animated icon */}
      <span className="relative w-4 h-4 overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            className="absolute inset-0 flex items-center justify-center"
            variants={iconVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {meta.icon}
          </motion.span>
        </AnimatePresence>
      </span>

      {showLabel && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme + '-label'}
            className="text-xs font-medium leading-none w-9 text-left"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, x: 4, transition: { duration: 0.12 } }}
          >
            {meta.label}
          </motion.span>
        </AnimatePresence>
      )}
    </motion.button>
  );
};
