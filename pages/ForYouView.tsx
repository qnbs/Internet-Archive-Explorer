import React, { useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { libraryItemsAtom } from '@/store/favorites';
import { searchHistoryAtom } from '@/store/search';
import { activeViewAtom } from '@/store';
import { searchArchive } from '@/services/archiveService';
import { useLanguage } from '@/hooks/useLanguage';
import { ContentCarousel } from '@/components/ContentCarousel';
import { OnThisDay } from '@/components/OnThisDay';
import { SparklesIcon, StarIcon, CompassIcon, TrendingIcon } from '@/components/Icons';
import type { ArchiveItemSummary, View } from '@/types';

// ─── Animation variants ───────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
};

// ─── Hero greeting ────────────────────────────────────────────────
const ForYouHero: React.FC = () => {
  const { t } = useLanguage();
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? '☀️'
      : hour < 17
        ? '🌤️'
        : '🌙';

  return (
    <motion.div
      variants={sectionVariants}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ia-500 via-ia-600 to-ia-700 text-white p-6 mb-6 shadow-glass"
    >
      {/* decorative blobs */}
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 blur-xl"
        aria-hidden="true"
      />
      <p className="text-3xl mb-1" aria-hidden="true">{greeting}</p>
      <h1 className="text-2xl font-bold tracking-tight">{t('forYou:title')}</h1>
      <p className="mt-1 text-ia-100 text-sm">{t('forYou:subtitle')}</p>
    </motion.div>
  );
};

// ─── Library-based recommendations ───────────────────────────────
const LibraryRecommendations: React.FC = () => {
  const { t } = useLanguage();
  const setActiveView = useSetAtom(activeViewAtom);
  const libraryItems = useAtomValue(libraryItemsAtom);

  const dominantMediaType = useMemo((): string | null => {
    const items = Object.values(libraryItems);
    if (!items.length) return null;
    const counts: Record<string, number> = {};
    for (const item of items) {
      const mt = item.mediatype ?? 'texts';
      counts[mt] = (counts[mt] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [libraryItems]);

  const { data, isLoading, error, refetch } = useQuery<ArchiveItemSummary[]>({
    queryKey: ['forYou', 'library', dominantMediaType],
    queryFn: async () => {
      if (!dominantMediaType) return [];
      const resp = await searchArchive(`mediatype:${dominantMediaType}`, 1, ['-week']);
      return resp.response?.docs.slice(0, 15) ?? [];
    },
    enabled: Boolean(dominantMediaType),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const isEmpty = !Object.keys(libraryItems).length;

  if (isEmpty) {
    return (
      <motion.div
        variants={sectionVariants}
        className="glass rounded-xl p-5 flex flex-col items-center text-center gap-3 mb-6"
      >
        <StarIcon className="w-10 h-10 text-ia-400" />
        <p className="text-gray-600 dark:text-gray-300 text-sm">{t('forYou:noLibraryItems')}</p>
        <button
          onClick={() => setActiveView('library' as View)}
          className="text-sm font-medium text-ia-600 dark:text-ia-300 hover:underline"
        >
          {t('forYou:goToLibrary')}
        </button>
      </motion.div>
    );
  }

  const mediaTypeLabel =
    dominantMediaType
      ? t(`forYou:mediaTypes.${dominantMediaType}`, { defaultValue: dominantMediaType })
      : '';

  return (
    <motion.div variants={sectionVariants} className="mb-6">
      <ContentCarousel
        title={`${t('forYou:basedOnLibrary')} · ${mediaTypeLabel}`}
        items={data ?? []}
        isLoading={isLoading}
        error={error ? t('common:error') : null}
        onRetry={refetch}
        cardAspectRatio="video"
        titleIcon={<StarIcon className="w-4 h-4" />}
      />
    </motion.div>
  );
};

// ─── Continue Exploring (recent search history) ───────────────────
const ContinueExploring: React.FC = () => {
  const { t } = useLanguage();
  const setActiveView = useSetAtom(activeViewAtom);
  const searchHistory = useAtomValue(searchHistoryAtom);
  const recentQuery = searchHistory[0] ?? null;

  const { data, isLoading, error, refetch } = useQuery<ArchiveItemSummary[]>({
    queryKey: ['forYou', 'searchHistory', recentQuery],
    queryFn: async () => {
      if (!recentQuery) return [];
      const resp = await searchArchive(recentQuery, 1, ['-downloads']);
      return resp.response?.docs.slice(0, 15) ?? [];
    },
    enabled: Boolean(recentQuery),
    staleTime: 5 * 60 * 1000,
  });

  if (!recentQuery) {
    return (
      <motion.div
        variants={sectionVariants}
        className="glass rounded-xl p-5 flex flex-col items-center text-center gap-3 mb-6"
      >
        <CompassIcon className="w-10 h-10 text-ia-400" />
        <p className="text-gray-600 dark:text-gray-300 text-sm">{t('forYou:noSearchHistory')}</p>
        <button
          onClick={() => setActiveView('explore' as View)}
          className="text-sm font-medium text-ia-600 dark:text-ia-300 hover:underline"
        >
          {t('forYou:exploreNow')}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={sectionVariants} className="mb-6">
      <ContentCarousel
        title={`${t('forYou:continueExploring')} · "${recentQuery}"`}
        items={data ?? []}
        isLoading={isLoading}
        error={error ? t('common:error') : null}
        onRetry={refetch}
        cardAspectRatio="video"
        titleIcon={<CompassIcon className="w-4 h-4" />}
      />
    </motion.div>
  );
};

// ─── Trending Today ───────────────────────────────────────────────
const TrendingSection: React.FC = () => {
  const { t } = useLanguage();

  const { data, isLoading, error, refetch } = useQuery<ArchiveItemSummary[]>({
    queryKey: ['forYou', 'trending'],
    queryFn: async () => {
      const resp = await searchArchive('', 1, ['-week']);
      return resp.response?.docs.slice(0, 15) ?? [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  return (
    <motion.div variants={sectionVariants} className="mb-6">
      <ContentCarousel
        title={t('forYou:trendingToday')}
        items={data ?? []}
        isLoading={isLoading}
        error={error ? t('common:error') : null}
        onRetry={refetch}
        cardAspectRatio="video"
        titleIcon={<TrendingIcon className="w-4 h-4" />}
      />
    </motion.div>
  );
};

// ─── On This Day wrapper ──────────────────────────────────────────
const OnThisDaySection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <motion.div variants={sectionVariants} className="mb-6">
      <div className="flex items-center gap-2 mb-2 px-1">
        <SparklesIcon className="w-4 h-4 text-ia-500" />
        <span className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
          {t('forYou:onThisDay')}
        </span>
      </div>
      <OnThisDay />
    </motion.div>
  );
};

// ─── Main export ──────────────────────────────────────────────────
const ForYouView: React.FC = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto px-4 py-6"
    >
      <ForYouHero />
      <LibraryRecommendations />
      <ContinueExploring />
      <TrendingSection />
      <OnThisDaySection />
    </motion.div>
  );
};

export default ForYouView;
