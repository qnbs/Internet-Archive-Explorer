import { useAtom } from 'jotai';
import { ClipboardPaste, ExternalLink, Eye, EyeOff } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  GEMINI_API_KEY_STORAGE_KEY,
  isPlausibleGeminiApiKey,
} from '@/services/geminiApiKeyStorage';
import { geminiApiKeyAtom } from '@/store/geminiApiKey';

const AI_STUDIO_KEY_URL = 'https://aistudio.google.com/app/apikey';

export const ApiKeyInput: React.FC = () => {
  const { t } = useLanguage();
  const [apiKey, setApiKeyAtom] = useAtom(geminiApiKeyAtom);
  const [draft, setDraft] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(() => Boolean(apiKey.trim()));
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const inputId = 'gemini-api-key-input';
  const hintId = `${inputId}-hint`;

  const handleSave = useCallback(() => {
    const value = draft.trim();
    if (value && !isPlausibleGeminiApiKey(value)) {
      setValidationHint(t('settings:apiKey.invalidFormat'));
      setIsSaved(false);
      return;
    }
    setValidationHint(null);
    setApiKeyAtom(value);
    setDraft(value);
    setIsSaved(Boolean(value));
  }, [draft, setApiKeyAtom, t]);

  const handleClear = useCallback(() => {
    if (!window.confirm(t('settings:apiKey.clearConfirm'))) return;
    setDraft('');
    setApiKeyAtom('');
    setIsSaved(false);
    setValidationHint(null);
  }, [setApiKeyAtom, t]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setDraft(text.trim());
    } catch {
      setValidationHint(t('settings:apiKey.pasteFailed'));
    }
  }, [t]);

  const statusText = isSaved ? t('settings:apiKey.saved') : t('settings:apiKey.notSaved');

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-300">{t('settings:apiKey.privacy')}</p>
      <div>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-900 dark:text-gray-200"
        >
          {t('settings:apiKey.label')}
        </label>
        <div className="mt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <input
              id="gemini-api-key-input"
              type={showKey ? 'text' : 'password'}
              autoComplete="off"
              spellCheck={false}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setIsSaved(false);
                setValidationHint(null);
              }}
              placeholder={t('settings:apiKey.placeholder')}
              aria-describedby={hintId}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-20 text-sm focus:ring-accent-500 focus:border-accent-500"
            />
            <div className="absolute inset-y-0 right-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="touch-target-min p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                aria-label={showKey ? t('settings:apiKey.hideKey') : t('settings:apiKey.showKey')}
              >
                {showKey ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
              </button>
              <button
                type="button"
                onClick={() => void handlePaste()}
                className="touch-target-min p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                aria-label={t('settings:apiKey.paste')}
              >
                <ClipboardPaste size={16} aria-hidden />
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors touch-target-min"
          >
            {t('settings:apiKey.save')}
          </button>
          {isSaved && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors touch-target-min"
            >
              {t('settings:apiKey.clear')}
            </button>
          )}
        </div>
        <p
          id={hintId}
          className={`mt-2 text-sm ${validationHint ? 'text-red-600 dark:text-red-400' : isSaved ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          {validationHint ?? statusText}
        </p>
      </div>
      <a
        href={AI_STUDIO_KEY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-accent-600 dark:text-accent-400 hover:underline touch-target-min"
      >
        {t('settings:apiKey.getKey')}
        <ExternalLink size={14} aria-hidden />
      </a>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t('settings:apiKey.storageNote', { key: GEMINI_API_KEY_STORAGE_KEY })}
      </p>
    </div>
  );
};

export default ApiKeyInput;
