import React from 'react';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { cn } from '@shared/lib/utils';

import LoadingStage from './LoadingStage';
import { useDataContext } from './useDataContext';

/**
 * Shows the current loading stage, used for debugging. When data is finished loading,
 * the text is hidden by setting its color to the background color.
 */
const LoadingStageDisplay: React.FC = () => {
  const { loadingStage } = useDataContext();

  return (
    <div
      aria-hidden={loadingStage === LoadingStage.AlgorithmsFinished}
      className={cn(
        'LoadingStageDisplay mt-4 text-center',
        loadingStage === LoadingStage.AlgorithmsFinished && 'text-background',
      )}
    >
      Loading stage: {loadingStage + 1} of 4, {getLoadingStageLabel(loadingStage)}
    </div>
  );
};

export function getLoadingStageLabel(stage: LoadingStage): string {
  switch (stage) {
    case LoadingStage.Initial:
      return 'initial';
    case LoadingStage.HasCoreData:
      return 'has core data';
    case LoadingStage.HasSupplementalData:
      return 'has supplemental data';
    case LoadingStage.AlgorithmsFinished:
      return 'algorithms finished';
    default:
      enforceExhaustiveSwitch(stage);
  }
}

export default LoadingStageDisplay;
