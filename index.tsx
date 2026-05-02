import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { ArchiveServiceError } from '@/services/archiveService';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

function queryRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (error instanceof ArchiveServiceError && error.retryable === false) return false;
  return true;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 min baseline cache window
      gcTime: 1000 * 60 * 60 * 4, // keep inactive query data for 4h
      retry: queryRetry,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const iaQueryDefaults = {
  staleTime: 1000 * 60 * 30, // IA content changes slowly; favor cache reuse
  gcTime: 1000 * 60 * 60 * 12, // preserve browsing context for long sessions
} as const;

queryClient.setQueryDefaults(['archivalItems'], iaQueryDefaults);
queryClient.setQueryDefaults(['infiniteArchive'], iaQueryDefaults);
queryClient.setQueryDefaults(['explorerSearch'], iaQueryDefaults);
queryClient.setQueryDefaults(['metadata'], iaQueryDefaults);
queryClient.setQueryDefaults(['plaintext'], iaQueryDefaults);
queryClient.setQueryDefaults(['uploaderUploads'], iaQueryDefaults);
queryClient.setQueryDefaults(['uploaderStats'], iaQueryDefaults);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>,
);
