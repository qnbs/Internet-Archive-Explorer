import { useQuery } from '@tanstack/react-query';
import { getItemCount } from '@/services/archiveService';
import type { Profile, UploaderStats } from '@/types';
import { getProfileApiQuery } from '@/utils/profileUtils';
import { promiseAllWithConcurrency } from '@/utils/requestQueue';

export const useUploaderStats = (profile: Profile) => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery<UploaderStats, Error>({
    queryKey: ['uploaderStats', profile.searchIdentifier],
    queryFn: async () => {
      const baseQuery = getProfileApiQuery(profile);
      const username = profile.searchIdentifier.split('@')[0];

      const mediaTypes: (keyof Pick<
        UploaderStats,
        'movies' | 'audio' | 'texts' | 'image' | 'software'
      >)[] = ['movies', 'audio', 'texts', 'image', 'software'];

      const tasks: Array<() => Promise<number>> = [
        () => getItemCount(baseQuery),
        ...mediaTypes.map((type) => () => getItemCount(`${baseQuery} AND mediatype:${type}`)),
        () => getItemCount(`uploader:("${profile.searchIdentifier}") AND mediatype:collection`),
        () => getItemCount(`collection:(fav-${username})`),
        () => getItemCount(`reviewer:("${profile.searchIdentifier}")`),
      ];

      const results = await promiseAllWithConcurrency(tasks, 3);
      const [total, movies, audio, texts, image, software, collections, favorites, reviews] =
        results;

      return { total, movies, audio, texts, image, software, collections, favorites, reviews };
    },
  });

  return {
    stats: stats ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
};
