import React from 'react';

import { Button } from '@shared/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.errorMessage || 'An unknown error occurred'} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="h-screen pt-[20vh] text-center">
      <h2>Something went wrong.</h2>
      <p>Please try refreshing the page or contact support if the issue persists.</p>
      <p>{message}</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
};

export default ErrorBoundary;
