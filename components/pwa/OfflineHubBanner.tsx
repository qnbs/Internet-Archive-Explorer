import { useAtomValue } from 'jotai';
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { activeViewAtom } from '@/store';
import type { View } from '@/types';

function offlineMessageKey(view: View): 'library' | 'trendingHub' | 'generic' {
  if (view === 'library') return 'library';
  if (view === 'explore' || view === 'forYou') return 'trendingHub';
  return 'generic';
}

/**
 * Non-blocking offline notice for the active hub (WCAG: `role="status"`, polite live region).
 */
export const OfflineHubBanner: React.FC = () => {
  const online = useOnlineStatus();
  const activeView = useAtomValue(activeViewAtom);
  const { t } = useLanguage();

  if (online) {
    return null;
  }

  const key = offlineMessageKey(activeView);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-100 shadow-sm dark:bg-amber-950/60 dark:text-amber-50"
    >
      <p className="leading-relaxed">{t(`pwa:offline.${key}`)}</p>
    </div>
  );
};
