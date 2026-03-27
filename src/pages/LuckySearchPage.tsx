import React, { Suspense } from 'react';

import Loading from '@widgets/Loading';

const LuckySearchPageBody = React.lazy(() => import('./LuckySearchPageBody'));

const LuckySearchPage: React.FC = () => {
  /* DataProvider and other data components have more lines of code so they are loaded lazily */
  return (
    <Suspense fallback={<Loading />}>
      <LuckySearchPageBody />
    </Suspense>
  );
};

export default LuckySearchPage;
