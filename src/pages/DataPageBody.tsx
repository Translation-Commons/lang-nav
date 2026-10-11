import React from 'react';

import PageFooter from '@widgets/PageFooter';

import LoadingStageDisplay from '@features/data/context/LoadingStageDisplay';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import DataPageHeader from './DataPageHeader';

const DataViews = React.lazy(() => import('./dataviews/DataViews'));

const DataPageBody: React.FC = () => {
  return (
    <div className="flex-1 w-full h-full overflow-auto">
      <main className="px-4 py-2">
        <DataPageHeader />
        <div className="max-w-5xl mx-auto p-4 text-center">
          <ContainErrorsAndSuspense>
            <DataViews />
          </ContainErrorsAndSuspense>
        </div>
        <LoadingStageDisplay />
      </main>
      <PageFooter />
    </div>
  );
};

export default DataPageBody;
