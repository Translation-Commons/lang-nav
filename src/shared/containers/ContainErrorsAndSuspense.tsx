import React from 'react';

import LoadingPage from '@shared/ui/LoadingPage';
import { Spinner } from '@shared/ui/spinner';

import ErrorBoundary from './ErrorBoundary';

type Props = React.PropsWithChildren<{
  showProgressBar?: boolean;
}>;

const ContainErrorsAndSuspense = ({ children, showProgressBar = true }: Props) => {
  return (
    <React.Suspense fallback={showProgressBar ? <LoadingPage /> : <Spinner className="mx-auto" />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </React.Suspense>
  );
};

export default ContainErrorsAndSuspense;
