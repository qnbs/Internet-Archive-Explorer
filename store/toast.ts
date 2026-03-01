import { atom } from 'jotai';
import type { ToastType } from '@/types';

/**
 * Payload for the bridge atom (without generated id).
 */
export interface ToastBridgeMessage {
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * An atom to hold a single toast message object.
 * Components can write to this atom to trigger a toast.
 * The ToastBridge component listens for changes and uses the ToastContext to display it.
 * It's set to null after being displayed to be ready for the next message.
 */
export const toastAtom = atom<ToastBridgeMessage | null>(null);
