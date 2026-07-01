import type { ToastBridgeMessage } from '@/store/toast';

type TranslateFn = (key: string, replacements?: Record<string, string | number>) => string;

/** Resolves a toast bridge payload to a display string (i18n key or raw message). */
export function resolveToastMessage(toast: ToastBridgeMessage, t: TranslateFn): string {
  if (toast.i18nKey) {
    return t(toast.i18nKey, toast.i18nParams);
  }
  return toast.message ?? '';
}
