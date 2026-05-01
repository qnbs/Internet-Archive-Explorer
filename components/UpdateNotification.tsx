import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { CloseIcon, SparklesIcon } from './Icons';

interface UpdateNotificationProps {
  waitingWorker: ServiceWorker | null;
  onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ waitingWorker, onUpdate }) => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (waitingWorker) {
      setShow(true);
    }
  }, [waitingWorker]);

  if (!show) {
    return null;
  }

  const handleClose = () => {
    setShow(false);
  };

  return (
    <div
      className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 bg-gray-800 border border-cyan-500/50 rounded-xl shadow-2xl animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <SparklesIcon className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-base font-medium text-white">{t('updateNotification:title')}</p>
          <p className="mt-1 text-sm text-gray-300">{t('updateNotification:message')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onUpdate}
              className="touch-target-min inline-flex items-center justify-center min-h-11 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus-visible:ia-focus-visible-enhanced focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
            >
              {t('updateNotification:refresh')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="touch-target-min inline-flex items-center justify-center min-h-11 px-4 py-2 border border-gray-500 text-sm font-medium rounded-md text-gray-100 hover:bg-gray-700 focus-visible:ia-focus-visible-enhanced focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-800"
            >
              {t('updateNotification:later')}
            </button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            type="button"
            onClick={handleClose}
            className="touch-target-min inline-flex rounded-md min-h-11 min-w-11 items-center justify-center text-gray-400 hover:text-white focus-visible:ia-focus-visible-enhanced focus:ring-2 focus:ring-cyan-500"
            aria-label={t('common:close')}
          >
            <CloseIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
