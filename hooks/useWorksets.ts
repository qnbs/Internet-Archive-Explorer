import { useAtomValue, useSetAtom } from 'jotai';
import { 
    worksetsAtom, 
    createWorksetAtom, 
    deleteWorksetAtom, 
    updateWorksetNameAtom, 
    addDocumentToWorksetAtom, 
    removeDocumentFromWorksetAtom, 
    updateDocumentNotesAtom 
} from '../store/scriptorium';
import { useEffect, useState } from 'react';

// This hook now serves as a convenient facade for interacting with the Scriptorium Jotai atoms.
// Components can use this single hook to get all the necessary functions and state,
// while the logic itself lives within the Jotai atoms.
export const useWorksets = () => {
  const [isLoading, setIsLoading] = useState(true);
  const worksets = useAtomValue(worksetsAtom);
  
  // Setters for all the actions
  const createWorkset = useSetAtom(createWorksetAtom);
  const deleteWorkset = useSetAtom(deleteWorksetAtom);
  const updateWorksetName = useSetAtom(updateWorksetNameAtom);
  const addDocumentToWorkset = useSetAtom(addDocumentToWorksetAtom);
  const removeDocumentFromWorkset = useSetAtom(removeDocumentFromWorksetAtom);
  const updateDocumentNotes = useSetAtom(updateDocumentNotesAtom);

  // The atomWithStorage is synchronous on read, but we keep this async-like
  // `isLoading` flag for a brief moment to prevent flashes of content
  // on initial hydration, maintaining consistency with the previous hook's behavior.
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  return {
    worksets,
    isLoading,
    createWorkset,
    deleteWorkset,
    updateWorksetName,
    addDocumentToWorkset,
    removeDocumentFromWorkset,
    updateDocumentNotes,
  };
};