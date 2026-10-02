import { useAtomValue } from 'jotai';
import { useLanguage } from '@/hooks/useLanguage';
import { lastCacheAgeAtom } from '@/store/cacheAge';
import { formatCacheAge } from '@/utils/cacheAge';

/**
 * Small inline indicator showing how old the last service-worker-cached
 * Archive response was. Hidden when no cached response has been recorded.
 */
type CacheAgeIndicatorProps = {
  /** Hub/local IndexedDB timestamp; falls back to service-worker cache age atom. */
  cacheTimeMs?: number | null;
};

export const CacheAgeIndicator: React.FC<CacheAgeIndicatorProps> = ({ cacheTimeMs }) => {
  const swCacheTime = useAtomValue(lastCacheAgeAtom);
  const effectiveTime = cacheTimeMs ?? swCacheTime;
  const { t, language } = useLanguage();

  if (!effectiveTime) {
    return null;
  }

  const age = formatCacheAge(effectiveTime, language);

  return (
    <span
      className="text-xs text-ia-500 dark:text-ia-400"
      aria-label={`${t('common:cacheAge.cached')} ${age}`}
    >
      {t('common:cacheAge.cached')} {age}
    </span>
  );
};
