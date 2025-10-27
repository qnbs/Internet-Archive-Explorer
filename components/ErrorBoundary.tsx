import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Added a constructor to properly initialize the component's state and props.
  // This ensures `this.props` is correctly typed and accessible within the component instance.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("========================================");
    console.error("Uncaught error in ErrorBoundary:");
    console.error(error);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("========================================");
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 text-center z-[100]">
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

    return this.props.children;
  }
}

export default ErrorBoundary;
