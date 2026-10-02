import React from 'react';

import { getLoadingStageLabel } from '@features/data/context/LoadingStageDisplay';
import { useDataContext } from '@features/data/context/useDataContext';

import { Spinner } from '@shared/ui/spinner';

import BackgroundProgressBar from './BackgroundProgressBar';

const LoadingPage: React.FC = () => {
  const { loadingStage } = useDataContext();

  return (
    <div style={{ height: '100vh', textAlign: 'center', paddingTop: '20vh' }}>
      <h2>
        {/* The heading already announces the loading state, so the spinner is decorative here. */}
        Loading... <Spinner aria-hidden="true" className="inline size-[1em]" />
      </h2>
      <p>Please wait while the content is being prepared.</p>
      <p>
        <BackgroundProgressBar percentage={((loadingStage + 1) / 5) * 100}>
          Current loading stage: {getLoadingStageLabel(loadingStage)} ({loadingStage + 1} of 5)
        </BackgroundProgressBar>
      </p>
    </div>
  );
};

export default LoadingPage;
