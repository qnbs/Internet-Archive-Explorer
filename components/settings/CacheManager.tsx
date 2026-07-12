import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { TrashIcon } from '@/components/Icons';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/hooks/useLanguage';
import { type CacheStats, clearAllCaches, getCacheStats } from '@/services/cacheService';
import { lastCacheAgeAtom } from '@/store/cacheAge';

export const CacheManager: React.FC = () => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const lastCacheTime = useAtomValue(lastCacheAgeAtom);
  const [stats, setStats] = useState<CacheStats>({ metadataCount: 0, searchCount: 0 });
  const [isClearing, setIsClearing] = useState(false);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await getCacheStats());
    } catch {
      // ignore — IndexedDB may be unavailable in private mode
    }
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const handleClear = async () => {
    setIsClearing(true);
    try {
      await clearAllCaches();
      await refreshStats();
      addToast(t('settings:data.cacheCleared'), 'success');
    } catch {
      addToast(t('settings:data.cacheClearError'), 'error');
    } finally {
      setIsClearing(false);
    }
  };

  const hasCache = stats.metadataCount > 0 || stats.searchCount > 0 || lastCacheTime != null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
        {t('settings:data.cacheTitle')}
      </h3>
      <div className="py-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('settings:data.cacheDesc')}
        </p>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
          <p>{t('settings:data.cacheMetadataCount', { count: stats.metadataCount })}</p>
          <p>{t('settings:data.cacheSearchCount', { count: stats.searchCount })}</p>
        </div>
        <button
          onClick={handleClear}
          disabled={!hasCache || isClearing}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          type="button"
        >
          <TrashIcon className="w-4 h-4" />
          <span>{isClearing ? t('common:loading') : t('settings:data.clearCacheButton')}</span>
        </button>
      </div>
    </div>
  );
};
