import React, { ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { logger } from '@/utils/logger';

interface HubErrorBoundaryInnerProps {
  error: Error | null;
  onRetry: () => void;
}

const HubErrorFallback: React.FC<HubErrorBoundaryInnerProps> = ({ error, onRetry }) => {
  const { t } = useLanguage();

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center rounded-xl border border-red-500/30 bg-red-500/5"
      role="alert"
      aria-live="assertive"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {t('common:hubError.title')}
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {t('common:hubError.description')}
      </p>
      {error && import.meta.env.DEV && (
        <p className="text-xs font-mono text-red-500/80 mb-4 max-w-lg truncate">{error.message}</p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="px-4 py-2 text-sm font-semibold bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors touch-target-min ia-focus-visible-enhanced"
      >
        {t('common:hubError.retry')}
      </button>
    </div>
  );
};

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Inline recovery for lazy-loaded hub views — avoids full-app crash screen. */
class HubErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Hub view error', error, errorInfo.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return <HubErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

export default HubErrorBoundary;
