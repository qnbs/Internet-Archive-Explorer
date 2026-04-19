import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import type { DownloadItem } from '@/store/downloads';
import {
  activeDownloadCountAtom,
  clearCompletedDownloadsAtom,
  downloadManagerOpenAtom,
  downloadQueueAtom,
  removeDownloadAtom,
} from '@/store/downloads';

const StatusIcon: React.FC<{ status: DownloadItem['status'] }> = ({ status }) => {
  if (status === 'done')
    return (
      <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  if (status === 'error')
    return (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  if (status === 'downloading')
    return (
      <svg
        className="w-4 h-4 text-accent-400 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    );
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

const formatBytes = (bytes: number) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const DownloadManager: React.FC = () => {
  const [isOpen, setIsOpen] = useAtom(downloadManagerOpenAtom);
  const queue = useAtomValue(downloadQueueAtom);
  const activeCount = useAtomValue(activeDownloadCountAtom);
  const removeDownload = useSetAtom(removeDownloadAtom);
  const clearCompleted = useSetAtom(clearCompletedDownloadsAtom);
  const { t } = useLanguage();

  if (queue.length === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3 py-2 bg-gray-800 dark:bg-gray-900 border border-gray-600 rounded-full shadow-xl text-white text-sm font-medium"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        aria-label={t('downloads:toggle') || 'Download Manager'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {activeCount > 0 && (
          <span className="bg-accent-500 text-white text-xs rounded-full min-w-[1.2rem] h-5 flex items-center justify-center px-1">
            {activeCount}
          </span>
        )}
        {t('downloads:title') || 'Downloads'}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-40 right-4 z-40 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t('downloads:title') || 'Downloads'}
                {activeCount > 0 && (
                  <span className="ml-2 bg-accent-500/15 text-accent-600 dark:text-accent-400 text-xs px-1.5 py-0.5 rounded-full">
                    {activeCount} aktiv
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {queue.some((d) => d.status === 'done' || d.status === 'error') && (
                  <button
                    onClick={() => clearCompleted()}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {t('downloads:clearDone') || 'Clear done'}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {queue.length === 0 ? (
                <p className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {t('downloads:empty') || 'No downloads yet.'}
                </p>
              ) : (
                queue
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div key={item.id} className="p-3 flex items-start gap-3">
                      <StatusIcon status={item.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {item.filename}
                        </p>
                        {(item.status === 'downloading' || item.status === 'queued') &&
                          item.sizeBytes && (
                            <div className="mt-1.5">
                              <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                                <span>{formatBytes(item.downloadedBytes)}</span>
                                <span>{formatBytes(item.sizeBytes)}</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                <motion.div
                                  className="bg-accent-500 h-1 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${(item.downloadedBytes / item.sizeBytes) * 100}%`,
                                  }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            </div>
                          )}
                        {item.status === 'error' && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {t('downloads:failed') || 'Download failed'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeDownload(item.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                        aria-label="Remove"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
