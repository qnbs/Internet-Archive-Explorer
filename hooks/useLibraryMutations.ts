import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSetAtom, useAtomValue } from 'jotai';
import { libraryItemsAtom, addLibraryItemAtom, removeLibraryItemAtom } from '@/store/favorites';
import type { ArchiveItemSummary } from '@/types';

/**
 * Provides optimistic-update mutations for the local Library (Jotai + localStorage).
 *
 * Since the library is stored client-side only (no server round-trip), the mutation
 * function is effectively a no-op and errors are extremely unlikely.  We still use
 * `useMutation` to get `isPending` status flags and to integrate with the query cache
 * via `invalidateQueries` for any views that read the `['library']` query key.
 */
export const useLibraryMutations = () => {
  const queryClient = useQueryClient();

  // Snapshot for rollback
  const currentItems = useAtomValue(libraryItemsAtom);
  const addItem = useSetAtom(addLibraryItemAtom);
  const removeItem = useSetAtom(removeLibraryItemAtom);
  const setItems = useSetAtom(libraryItemsAtom);

  const addMutation = useMutation({
    mutationFn: async (item: ArchiveItemSummary) => item,
    onMutate: (item) => {
      const prev = currentItems;
      addItem(item); // optimistic: immediately update Jotai atom
      return { prev };
    },
    onError: (_err, _item, context) => {
      if (context?.prev) setItems(context.prev); // rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (identifier: string) => identifier,
    onMutate: (identifier) => {
      const prev = currentItems;
      removeItem(identifier); // optimistic
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) setItems(context.prev); // rollback
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  return {
    addToLibrary: addMutation.mutate,
    removeFromLibrary: removeMutation.mutate,
    isAddingToLibrary: addMutation.isPending,
    isRemovingFromLibrary: removeMutation.isPending,
  };
};
