import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error and component stack to the console for easier debugging
    console.error("========================================");
    console.error("Uncaught error in ErrorBoundary:");
    console.error(error);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("========================================");
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 text-center">
          <h1 className="text-2xl font-bold text-red-500">Something went wrong.</h1>
          <p className="mt-2">We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // FIX: Destructure children from this.props to resolve potential type inference issue.
    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;