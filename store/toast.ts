import { atom } from 'jotai';
import type { ToastType } from '../types';

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 * Placed here to avoid circular dependencies, as many stores need to trigger toasts.
 */
// FIX: Simplified atom to be a primitive writable atom.
type ToastUpdate = { message: string; type: ToastType } | null;

export const toastAtom = atom<ToastUpdate>(null);
