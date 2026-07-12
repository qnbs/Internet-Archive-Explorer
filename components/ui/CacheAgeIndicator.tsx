import { useAtomValue } from 'jotai';
import { useLanguage } from '@/hooks/useLanguage';
import { lastCacheAgeAtom } from '@/store/cacheAge';
import { formatCacheAge } from '@/utils/cacheAge';

/**
 * Small inline indicator showing how old the last service-worker-cached
 * Archive response was. Hidden when no cached response has been recorded.
 */
export const CacheAgeIndicator: React.FC = () => {
  const lastCacheTime = useAtomValue(lastCacheAgeAtom);
  const { t, language } = useLanguage();

  if (!lastCacheTime) {
    return null;
  }

  const age = formatCacheAge(lastCacheTime, language);

  return (
    <span
      className="text-xs text-ia-500 dark:text-ia-400"
      aria-label={`${t('common:cacheAge.cached')} ${age}`}
    >
      {t('common:cacheAge.cached')} {age}
    </span>
  );
};
