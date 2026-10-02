import React from 'react';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import LoadingStage from './LoadingStage';
import { useDataContext } from './useDataContext';

/**
 * Shows the current loading stage, used for debugging. When data is finished loading,
 * the text is hidden by setting its color to the background color.
 */
const LoadingStageDisplay: React.FC = () => {
  const { loadingStage } = useDataContext();
  const isFinished = loadingStage === LoadingStage.AlgorithmsFinished;

  return (
    <div
      aria-hidden={isFinished}
      className="LoadingStageDisplay align-center mt-4"
      style={{ color: isFinished ? 'var(--color-background)' : 'inherit' }}
    >
      Loading stage: {loadingStage + 1} of 5, {getLoadingStageLabel(loadingStage)}
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
    case LoadingStage.RecomputingAlgorithms:
      return 'updating population counts and names';
    case LoadingStage.AlgorithmsFinished:
      return 'algorithms finished';
    default:
      enforceExhaustiveSwitch(stage);
  }
}

export default LoadingStageDisplay;
