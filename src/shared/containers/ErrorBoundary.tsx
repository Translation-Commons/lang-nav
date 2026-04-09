import React from 'react';

const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrorMessage(event.message);
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (errorMessage) {
    return <ErrorFallback message={errorMessage} />;
  }

  return <>{children}</>;
};

const ErrorFallback: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div style={{ height: '100vh', textAlign: 'center', paddingTop: '20vh' }}>
      <h2>Something went wrong.</h2>
      <p>Please try refreshing the page or contact support if the issue persists.</p>
      <p>{message}</p>
    </div>
  );
};

export default ErrorBoundary;
