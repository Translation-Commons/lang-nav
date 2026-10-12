import React from 'react';

import { getLoadingStageLabel } from '@features/data/context/LoadingStageDisplay';
import { useDataContext } from '@features/data/context/useDataContext';

import { Spinner } from '@shared/ui/spinner';

import BackgroundProgressBar from './BackgroundProgressBar';

const LoadingPage: React.FC = () => {
  const { loadingStage } = useDataContext();

  return (
    <div
      className="flex flex-col gap-2 text-center"
      style={{ height: '100vh', paddingTop: '20vh' }}
    >
      <h2>
        {/* The heading already announces the loading state, so the spinner is decorative here. */}
        Loading... <Spinner aria-hidden="true" className="inline size-[1em]" />
      </h2>
      <div>Please wait while the content is being prepared.</div>
      <div>
        <BackgroundProgressBar percentage={((loadingStage + 1) / 5) * 100}>
          Current loading stage: {getLoadingStageLabel(loadingStage)} ({loadingStage + 1} of 5)
        </BackgroundProgressBar>
      </div>
    </div>
  );
};

export default LoadingPage;
