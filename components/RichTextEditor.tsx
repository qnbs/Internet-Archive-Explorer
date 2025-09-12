import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../hooks/useLanguage';
import { PencilAltIcon } from './Icons';

interface RichTextEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  debounceMs?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ initialValue, onSave, debounceMs = 1000 }) => {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSave(debouncedValue);
    // We only want to trigger save when the debounced value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  return (
    <div className="h-full flex flex-col bg-gray-900/50">
        <div className="flex-shrink-0 p-3 border-b border-gray-700">
            <h4 className="font-semibold text-white flex items-center space-x-2">
                <PencilAltIcon className="w-5 h-5" />
                <span>{t('scriptorium.reader.notes')}</span>
            </h4>
        </div>
        <div className="flex-grow p-1">
             <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={t('scriptorium.reader.notesPlaceholder')}
                className="w-full h-full bg-transparent text-gray-300 resize-none p-2 focus:outline-none placeholder-gray-500"
                aria-label={t('scriptorium.reader.notes')}
            />
        </div>
        <footer className="flex-shrink-0 text-right p-2 text-xs text-gray-500 border-t border-gray-700">
            {t('common:autosaved')}
        </footer>
    </div>
  );
};