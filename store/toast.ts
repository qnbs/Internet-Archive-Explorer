import { atom } from 'jotai';
import type { ToastType } from '../types';

/**
 * Represents the data structure for a toast notification request.
 */
export type ToastUpdate = { message: string; type: ToastType } | null;

/**
 * A "vehicle" atom designed to trigger toast notifications from anywhere in the app.
 * It is consumed by a single `ToastBridge` component which listens for changes,
 * displays the toast using a React Context, and then resets this atom to `null`.
 * This pattern decouples state logic from the UI implementation of the toast.
 * @example setToast({ type: 'success', message: 'Operation successful!' });
 */
export const toastAtom = atom<ToastUpdate>(null);
