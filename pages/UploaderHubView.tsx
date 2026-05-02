import { useAtom } from 'jotai';
import React, { useMemo, useState } from 'react';
import { UsersIcon } from '@/components/Icons';
import { UploaderProfileCard } from '@/components/UploaderProfileCard';
import { UploaderHubSidebar } from '@/components/uploader/UploaderHubSidebar';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigation } from '@/hooks/useNavigation';
import { UPLOADER_DATA } from '@/pages/uploaderData';
import { uploaderHubSearchQueryAtom } from '@/store/search';
import type { Profile, UploaderCategory } from '@/types';

function uploaderToProfile(u: (typeof UPLOADER_DATA)[number]): Profile {
  return {
    name: u.username,
    searchIdentifier: u.searchUploader,
    type: 'uploader',
    curatedData: u,
  };
}

function matchesSearch(profile: Profile, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const screen = profile.curatedData?.screenname?.toLowerCase() ?? '';
  return (
    profile.name.toLowerCase().includes(s) ||
    profile.searchIdentifier.toLowerCase().includes(s) ||
    screen.includes(s)
  );
}

const UploaderHubView: React.FC = () => {
  const { t } = useLanguage();
  const { navigateToProfile } = useNavigation();
  const [query, setQuery] = useAtom(uploaderHubSearchQueryAtom);
  const [category, setCategory] = useState<UploaderCategory | 'all'>('all');

  const allProfiles = useMemo(() => UPLOADER_DATA.map(uploaderToProfile), []);

  const filtered = useMemo(() => {
    return allProfiles.filter((p) => {
      if (category !== 'all' && p.curatedData?.category !== category) {
        return false;
      }
      return matchesSearch(p, query);
    });
  }, [allProfiles, category, query]);

  const { featuredProfiles, otherProfiles } = useMemo(() => {
    const showFeaturedSplit =
      category === 'all' && query.trim() === '' && filtered.some((p) => p.curatedData?.featured);

    if (!showFeaturedSplit) {
      const sorted = [...filtered].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      );
      return { featuredProfiles: [] as Profile[], otherProfiles: sorted };
    }

    const featured = filtered.filter((p) => p.curatedData?.featured);
    const rest = filtered.filter((p) => !p.curatedData?.featured);
    const orderIndex = new Map(UPLOADER_DATA.map((u, i) => [u.searchUploader, i]));
    featured.sort(
      (a, b) =>
        (orderIndex.get(a.searchIdentifier) ?? 0) - (orderIndex.get(b.searchIdentifier) ?? 0),
    );
    rest.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    return { featuredProfiles: featured, otherProfiles: rest };
  }, [category, filtered, query]);

  const showFeaturedSection = featuredProfiles.length > 0;

  return (
    <div className="animate-page-fade-in flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
      <div className="w-full lg:max-w-sm lg:flex-shrink-0">
        <UploaderHubSidebar
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
        />
      </div>

      <div className="min-w-0 flex-grow space-y-8">
        <header className="space-y-2 border-b border-gray-200 pb-6 dark:border-gray-700/50">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-accent-500/15 p-3 dark:bg-accent-500/20">
              <UsersIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" aria-hidden />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {t('uploaderHub:title')}
              </h1>
              <p className="mt-1 max-w-3xl text-gray-600 dark:text-gray-400">
                {t('uploaderHub:description')}
              </p>
            </div>
          </div>
        </header>

        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-600 dark:bg-gray-800/40"
            role="status"
          >
            <UsersIcon className="mb-4 h-14 w-14 text-gray-400 dark:text-gray-500" aria-hidden />
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              {t('uploaderHub:noResults.title')}
            </p>
            <p className="mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
              {t('uploaderHub:noResults.hint')}
            </p>
          </div>
        ) : (
          <>
            {showFeaturedSection && (
              <section aria-labelledby="uploader-hub-featured-heading" className="space-y-4">
                <h2
                  id="uploader-hub-featured-heading"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {t('uploaderHub:featured')}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {featuredProfiles.map((profile, index) => (
                    <UploaderProfileCard
                      key={profile.searchIdentifier}
                      profile={profile}
                      index={index}
                      onSelect={navigateToProfile}
                    />
                  ))}
                </div>
              </section>
            )}

            {(otherProfiles.length > 0 || !showFeaturedSection) && (
              <section
                aria-labelledby="uploader-hub-all-heading"
                className="space-y-4 scroll-mt-24"
              >
                <h2
                  id="uploader-hub-all-heading"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {showFeaturedSection
                    ? t('uploaderHub:moreContributors')
                    : category === 'all'
                      ? t('uploaderHub:allUploaders')
                      : t('uploaderHub:categoryTitle', {
                          category: t(`uploaderHub:categories.${category}`),
                        })}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {otherProfiles.map((profile, index) => (
                    <UploaderProfileCard
                      key={profile.searchIdentifier}
                      profile={profile}
                      index={index}
                      onSelect={navigateToProfile}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploaderHubView;
