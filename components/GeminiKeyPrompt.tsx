import { useAtomValue, useSetAtom } from 'jotai';
import { KeyRound, Settings } from 'lucide-react';
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigation } from '@/hooks/useNavigation';
import { hasGeminiApiKeyAtom } from '@/store/geminiApiKey';
import { settingsFocusSectionAtom } from '@/store/settingsNavigation';

interface GeminiKeyPromptProps {
  /** When true, always render the prompt (e.g. before an action). Default: show only when no key. */
  forceShow?: boolean;
  className?: string;
}

export const GeminiKeyPrompt: React.FC<GeminiKeyPromptProps> = ({
  forceShow = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const { navigateTo } = useNavigation();
  const hasKey = useAtomValue(hasGeminiApiKeyAtom);
  const setFocusSection = useSetAtom(settingsFocusSectionAtom);

  if (hasKey && !forceShow) return null;

  return (
    <div
      className={`rounded-xl border border-cyan-700/50 bg-gray-900/70 p-4 sm:p-5 ${className}`}
      role="status"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <KeyRound className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" aria-hidden />
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-gray-100">{t('settings:apiKey.title')}</h3>
          <p className="text-sm text-gray-300">{t('settings:apiKey.description')}</p>
          <button
            type="button"
            onClick={() => {
              setFocusSection('ai');
              navigateTo('settings');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-cyan-700 text-white rounded-lg hover:bg-cyan-600 transition-colors touch-target-min ia-focus-visible-enhanced"
          >
            <Settings size={16} aria-hidden />
            {t('common:geminiKeyPrompt.openSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};
