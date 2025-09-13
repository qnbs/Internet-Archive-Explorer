import { atom } from 'jotai';
import type { ToastType } from '../types';

/**
 * A vehicle atom to trigger toasts from anywhere in the app.
 * The ToastBridge component listens to this atom, displays the toast via context,
 * and then resets the atom to null.
 * Placed here to avoid circular dependencies, as many stores need to trigger toasts.
 */
const baseToastAtom = atom<{ message: string; type: ToastType } | null>(null);
// FIX: The explicit generic type arguments for `atom` were causing incorrect type inference.
// Switched to inferring the type from the read/write functions, with an explicit type on the `update` parameter to guide TypeScript.
export const toastAtom = atom(
    (get) => get(baseToastAtom),
    (get, set, update: { message: string; type: ToastType } | null) => {
        set(baseToastAtom, update);
    }
);
