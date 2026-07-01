import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { ArchiveLogoIcon, RefreshIcon, TrashIcon } from './Icons';

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  onRetry: () => void;
  onHardReset: () => void;
}

export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  onRetry,
  onHardReset,
}) => {
  const { t } = useLanguage();

  const handleHardReset = () => {
    if (window.confirm(t('common:errorBoundary.resetConfirm'))) {
      onHardReset();
    }
  };

  return (
    <div
      className="fixed inset-0 flex flex-col justify-center items-center bg-gray-900 text-white p-6 text-center z-[100] overflow-hidden animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        <div className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/20 border border-gray-700">
          <ArchiveLogoIcon className="w-14 h-14 text-cyan-400" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          {t('common:errorBoundary.title')}
        </h1>
        <p className="text-gray-400 mb-8 text-lg leading-relaxed">
          {t('common:errorBoundary.description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 touch-target-min"
          >
            <RefreshIcon className="w-5 h-5" aria-hidden />
            <span>{t('common:errorBoundary.retry')}</span>
          </button>
          <button
            type="button"
            onClick={handleHardReset}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-800 hover:bg-red-900/30 text-red-400 hover:text-red-300 font-semibold rounded-xl border border-gray-700 hover:border-red-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 touch-target-min"
          >
            <TrashIcon className="w-5 h-5" aria-hidden />
            <span>{t('common:errorBoundary.reset')}</span>
          </button>
        </div>

        {error && (
          <div className="mt-10 w-full">
            <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2 text-left ml-1">
              {t('common:errorBoundary.details')}
            </div>
            <div className="p-4 bg-black/50 rounded-lg w-full text-left overflow-auto max-h-40 border border-gray-800 font-mono text-xs text-red-400/90 shadow-inner custom-scrollbar">
              {error.toString()}
              {error.stack && (
                <div className="mt-2 opacity-50 whitespace-pre-wrap">{error.stack}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
