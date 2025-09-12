import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../hooks/useLanguage';
import { 
    PencilAltIcon, BoldIcon, ItalicIcon, UnderlineIcon, 
    ListUnorderedIcon, ListOrderedIcon 
} from './Icons';

interface RichTextEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  debounceMs?: number;
}

const EditorToolbar: React.FC = () => {
    const handleFormat = (command: string) => {
        document.execCommand(command, false);
    };
    return (
        <div className="flex items-center space-x-1 p-2 border-b border-gray-700">
            <button onClick={() => handleFormat('bold')} className="p-2 rounded hover:bg-gray-700"><BoldIcon /></button>
            <button onClick={() => handleFormat('italic')} className="p-2 rounded hover:bg-gray-700"><ItalicIcon /></button>
            <button onClick={() => handleFormat('underline')} className="p-2 rounded hover:bg-gray-700"><UnderlineIcon /></button>
            <button onClick={() => handleFormat('insertUnorderedList')} className="p-2 rounded hover:bg-gray-700"><ListUnorderedIcon /></button>
            <button onClick={() => handleFormat('insertOrderedList')} className="p-2 rounded hover:bg-gray-700"><ListOrderedIcon /></button>
        </div>
    );
};

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onSave, debounceMs = 1000 }) => {
  const { t } = useLanguage();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedValue = useDebounce(editorRef.current?.innerHTML || '', debounceMs);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialValue) {
        editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);
  
  useEffect(() => {
    if (debouncedValue !== initialValue) {
        onSave(debouncedValue);
        setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleInput = () => {
      setIsSaving(true);
  };
  
  return (
    <div className="h-full flex flex-col bg-gray-900/50">
        <div className="flex-shrink-0 p-3 border-b border-gray-700 flex justify-between items-center">
            <h4 className="font-semibold text-white flex items-center space-x-2">
                <PencilAltIcon className="w-5 h-5" />
                <span>{t('scriptorium:reader.notes')}</span>
            </h4>
        </div>
        <EditorToolbar />
        <div 
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="flex-grow p-3 prose-editor dark:prose-invert prose-sm max-w-none text-gray-300 focus:outline-none overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: initialValue }}
            aria-label={t('scriptorium:reader.notes')}
        />
        <footer className="flex-shrink-0 text-right p-2 text-xs text-gray-500 border-t border-gray-700">
            <span>{isSaving ? 'Saving...' : t('common:autosaved')}</span>
        </footer>
    </div>
  );
};