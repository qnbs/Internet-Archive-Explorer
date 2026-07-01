import React, { ErrorInfo, ReactNode } from 'react';
import { ErrorBoundaryFallback } from '@/components/ErrorBoundaryFallback';
import { logger } from '@/utils/logger';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(
      'Uncaught error in ErrorBoundary',
      error,
      'Component stack:',
      errorInfo.componentStack,
    );
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleHardReset = () => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith('app-') ||
        key.startsWith('scriptorium-') ||
        key.startsWith('ai-archive-') ||
        key.includes('jotai')
      ) {
        localStorage.removeItem(key);
      }
    });
    sessionStorage.clear();
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onHardReset={this.handleHardReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
