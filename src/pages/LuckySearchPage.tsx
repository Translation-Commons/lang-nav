import React from 'react';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

const LuckySearchPageBody = React.lazy(() => import('./LuckySearchPageBody'));

const LuckySearchPage: React.FC = () => {
  /* DataProvider and other data components have more lines of code so they are loaded lazily */
  return (
    <ContainErrorsAndSuspense>
      <LuckySearchPageBody />
    </ContainErrorsAndSuspense>
  );
};

export default LuckySearchPage;
