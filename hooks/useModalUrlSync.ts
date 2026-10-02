import { getDefaultStore, useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getItemMetadata } from '@/services/archiveService';
import { type ModalState, modalAtom } from '@/store/app';
import type { ArchiveItemSummary } from '@/types';
import { toArchiveItemSummary } from '@/utils/archiveItemUtils';

const MODAL_PARAM = 'modal';
const ID_PARAM = 'id';

const ITEM_MODAL_TYPES = new Set<string>(['itemDetail', 'imageDetail', 'emulator', 'bookReader']);
const SIMPLE_MODAL_TYPES = new Set<string>(['commandPalette', 'pwaInstall']);

function isSyncableModalType(
  type: string,
): type is
  | 'itemDetail'
  | 'imageDetail'
  | 'emulator'
  | 'bookReader'
  | 'commandPalette'
  | 'pwaInstall' {
  return ITEM_MODAL_TYPES.has(type) || SIMPLE_MODAL_TYPES.has(type);
}

function getItemFromModal(state: ModalState): ArchiveItemSummary | undefined {
  if ('item' in state) {
    return state.item;
  }
  return undefined;
}

function getIdentifierFromState(state: ModalState): string | undefined {
  if ('id' in state && typeof state.id === 'string') {
    return state.id;
  }
  return getItemFromModal(state)?.identifier;
}

function isSameModalState(a: ModalState, b: ModalState): boolean {
  if (a.type !== b.type) return false;
  if (a.type === 'none' && b.type === 'none') return true;
  const aId = getIdentifierFromState(a);
  const bId = getIdentifierFromState(b);
  return aId === bId;
}

function buildParamsFromModal(
  searchParams: URLSearchParams,
  modal: ModalState,
): URLSearchParams | null {
  const { type } = modal;

  if (type === 'none') {
    if (!searchParams.get(MODAL_PARAM)) return null;
    const next = new URLSearchParams(searchParams);
    next.delete(MODAL_PARAM);
    next.delete(ID_PARAM);
    return next;
  }

  if (!isSyncableModalType(type)) return null;

  const item = getItemFromModal(modal);
  const nextId = item?.identifier ?? null;
  const currentModal = searchParams.get(MODAL_PARAM);
  const currentId = searchParams.get(ID_PARAM);

  if (currentModal === type && currentId === nextId) return null;

  const next = new URLSearchParams(searchParams);
  next.set(MODAL_PARAM, type);
  if (nextId) {
    next.set(ID_PARAM, nextId);
  } else {
    next.delete(ID_PARAM);
  }
  return next;
}

function buildModalFromUrl(searchParams: URLSearchParams): ModalState | null {
  const type = searchParams.get(MODAL_PARAM);
  if (!type || !isSyncableModalType(type)) return null;

  if (SIMPLE_MODAL_TYPES.has(type)) {
    return { type } as ModalState;
  }

  const id = searchParams.get(ID_PARAM);
  if (!id) return null;

  return { type, id } as ModalState;
}

/**
 * Keeps the currently open modal in sync with the URL query string.
 *
 * Supported modal types:
 * - Item modals: `?modal=itemDetail&id=<identifier>` (also imageDetail, emulator, bookReader)
 * - Simple modals: `?modal=commandPalette` or `?modal=pwaInstall`
 *
 * Closing a modal removes the query parameters. Reloading a URL with modal
 * parameters restores the modal by fetching the item metadata.
 */
export function useModalUrlSync(): void {
  const modal = useAtomValue(modalAtom);
  const [searchParams, setSearchParams] = useSearchParams();
  const lastParamsRef = useRef(searchParams.toString());
  const fetchingIdRef = useRef<string | null>(null);
  const restoreGenerationRef = useRef(0);
  const metadataAbortRef = useRef<AbortController | null>(null);
  const hasRestoredFromUrl = useRef(false);

  useEffect(() => {
    const currentParams = searchParams.toString();

    const restoreItemModal = (restored: ModalState, id: string) => {
      if (fetchingIdRef.current === id) return;

      metadataAbortRef.current?.abort();
      const generation = restoreGenerationRef.current + 1;
      restoreGenerationRef.current = generation;
      const controller = new AbortController();
      metadataAbortRef.current = controller;
      fetchingIdRef.current = id;

      getItemMetadata(id, { signal: controller.signal })
        .then((metadata) => {
          if (generation !== restoreGenerationRef.current) return;
          fetchingIdRef.current = null;
          const summary = toArchiveItemSummary(metadata);
          getDefaultStore().set(modalAtom, {
            type: restored.type,
            item: summary,
          } as ModalState);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
          if (generation !== restoreGenerationRef.current) return;
          fetchingIdRef.current = null;
          const next = new URLSearchParams(searchParams);
          next.delete(MODAL_PARAM);
          next.delete(ID_PARAM);
          setSearchParams(next, { replace: true });
        });
    };

    if (!hasRestoredFromUrl.current) {
      const restored = buildModalFromUrl(searchParams);
      if (!restored) {
        getDefaultStore().set(modalAtom, { type: 'none' });
      } else if (SIMPLE_MODAL_TYPES.has(restored.type)) {
        getDefaultStore().set(modalAtom, restored);
      } else {
        const id = searchParams.get(ID_PARAM);
        if (id) {
          restoreItemModal(restored, id);
        }
      }
      lastParamsRef.current = currentParams;
      hasRestoredFromUrl.current = true;
      return;
    }

    if (lastParamsRef.current !== currentParams) {
      lastParamsRef.current = currentParams;
      const restored = buildModalFromUrl(searchParams);

      if (!restored) {
        metadataAbortRef.current?.abort();
        if (modal.type !== 'none') {
          getDefaultStore().set(modalAtom, { type: 'none' });
        }
        return;
      }

      if (isSameModalState(modal, restored)) return;

      if (SIMPLE_MODAL_TYPES.has(restored.type)) {
        getDefaultStore().set(modalAtom, restored);
        return;
      }

      const id = searchParams.get(ID_PARAM);
      if (id) {
        restoreItemModal(restored, id);
      }
      return;
    }

    if (fetchingIdRef.current) return;

    const next = buildParamsFromModal(searchParams, modal);
    if (next) {
      setSearchParams(next, { replace: true });
    }
  }, [modal, searchParams, setSearchParams]);

  useEffect(
    () => () => {
      metadataAbortRef.current?.abort();
    },
    [],
  );
}
