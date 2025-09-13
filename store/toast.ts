import { atom } from 'jotai';
import type { ToastType } from '../types';

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 * Placed here to avoid circular dependencies, as many stores need to trigger toasts.
 */
const baseToastAtom = atom<{ message: string; type: ToastType } | null>(null);
// FIX: Removed explicit type on `update` parameter to allow TypeScript to correctly infer the atom as writable.
// The explicit type was too narrow and caused overload resolution to fail.
export const toastAtom = atom(
    (get) => get(baseToastAtom),
    (get, set, update) => {
        set(baseToastAtom, update);
    }
);