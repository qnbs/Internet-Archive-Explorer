import { atom } from 'jotai';
import type { View, Profile, ArchiveItemSummary, ConfirmationOptions, ToastType } from '../types';

/**
 * Defines the shape of all possible modal states in the application.
 * The modal is controlled by a single atom, and its 'type' property
 * determines which modal component is rendered.
 */
export type ModalState =
  | { type: 'none' }
  | { type: 'itemDetail'; item: ArchiveItemSummary }
  | { type: 'imageDetail'; item: ArchiveItemSummary }
  | { type: 'emulator'; item: ArchiveItemSummary }
  | { type: 'bookReader'; item: ArchiveItemSummary }
  | { type: 'commandPalette' }
  | { type: 'confirmation'; options: ConfirmationOptions }
  | { type: 'newCollection' }
  | { type: 'addToCollection'; itemIds: string[] }
  | { type: 'addTags'; itemIds: string[] }
  | { type: 'magicOrganize'; itemIds: string[] };

/**
 * Represents the currently active main view/page of the application.
 * e.g., 'explore', 'library', 'settings'.
 */
export const activeViewAtom = atom<View>('explore');

/**
 * The central atom for controlling the application's modal state.
 * To open a modal, set this atom to an object with the corresponding 'type' and any required props.
 * To close any modal, set it back to `{ type: 'none' }`.
 * @example set(modalAtom, { type: 'itemDetail', item: myItem });
 * @example set(modalAtom, { type: 'none' });
 */
export const modalAtom = atom<ModalState>({ type: 'none' });

// --- Derived Modal Atoms for Convenience and Performance ---

/**
 * A read-only derived atom that returns `true` if any modal is currently open.
 * Components can subscribe to this for a lightweight way to check modal visibility
 * without re-rendering when the modal's specific content changes.
 * @example const isModalOpen = useAtomValue(isModalOpenAtom);
 */
export const isModalOpenAtom = atom((get) => get(modalAtom).type !== 'none');

/**
 * A read-only derived atom that returns the `type` of the currently active modal, or 'none'.
 * Useful for components that need to know which modal is open without needing its data.
 */
export const currentModalTypeAtom = atom((get) => get(modalAtom).type);


/**
 * A sophisticated write-only "action" atom to handle opening the correct item detail modal
 * based on the item's `mediatype`. This encapsulates the selection logic, decoupling item
 * cards from the main application's modal management.
 * @example const selectItem = useSetAtom(selectItemAtom);
 *          selectItem(myItem);
 */
export const selectItemAtom = atom(
    null, // This is a write-only atom
    (get, set, item: ArchiveItemSummary) => {
        switch (item.mediatype) {
            case 'image':
                set(modalAtom, { type: 'imageDetail', item });
                break;
            // Potentially more custom modals based on mediatype in the future
            default:
                set(modalAtom, { type: 'itemDetail', item });
                break;
        }
    }
);

// --- Profile Navigation Atoms ---

/**
 * Holds the profile data for the currently viewed contributor or creator.
 * Set to a `Profile` object to navigate to the `uploaderDetail` view.
 * Set to `null` to return from it.
 */
export const selectedProfileAtom = atom<Profile | null>(null);

/**
* Stores the view from which the user navigated to a profile page,
* allowing for a contextual "back" action.
*/
export const profileReturnViewAtom = atom<View | undefined>(undefined);
