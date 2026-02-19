import React, { Suspense } from 'react';

import Loading from '@widgets/Loading';

const PageParamsProvider = React.lazy(() => import('@features/params/PageParamsProvider'));
const DataProvider = React.lazy(() => import('@features/data/context/DataProvider'));
const LuckySearchPageBody = React.lazy(() => import('./LuckySearchPageBody'));

const LuckySearchPage: React.FC = () => {
  /* DataProvider and other data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
      <PageParamsProvider>
        <DataProvider>
          <LuckySearchPageBody />
        </DataProvider>
      </PageParamsProvider>
    </Suspense>
  );
};

export default LuckySearchPage;
