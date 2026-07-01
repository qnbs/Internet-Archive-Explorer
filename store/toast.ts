import { atom } from 'jotai';
import type { ToastType } from '@/types';

/**
 * Payload for the Jotai toast bridge (without generated id).
 * Use `i18nKey` from store actions; use `message` only when text is already resolved.
 */
export interface ToastBridgeMessage {
  type: ToastType;
  duration?: number;
  /** Pre-resolved display text (components with `useToast`). */
  message?: string;
  /** Namespace key for store-layer toasts, e.g. `scriptorium:toast.worksetCreated`. */
  i18nKey?: string;
  i18nParams?: Record<string, string | number>;
}

/**
 * Store-layer toast trigger. `ToastBridge` in App.tsx forwards to ToastContext.
 * Components should prefer `useToast()` from `@/contexts/ToastContext` directly.
 */
export const toastAtom = atom<ToastBridgeMessage | null>(null);
