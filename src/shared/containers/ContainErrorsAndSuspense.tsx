import React from 'react';

import LoadingPage from '@shared/ui/LoadingPage';

import ErrorBoundary from './ErrorBoundary';

const ContainErrorsAndSuspense = ({ children }: { children: React.ReactNode }) => {
  return (
    <React.Suspense fallback={<LoadingPage />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </React.Suspense>
  );
};

export default ContainErrorsAndSuspense;
