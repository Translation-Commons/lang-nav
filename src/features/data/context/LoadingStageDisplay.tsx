import React from 'react';

import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import LoadingStage from './LoadingStage';
import { useDataContext } from './useDataContext';

/**
 * Shows the current loading stage, used for debugging. When data is finished loading,
 * the text is hidden by setting its color to the background color.
 */
const LoadingStageDisplay: React.FC = () => {
  const { loadingStage } = useDataContext();
  const { isPending } = useFilteredEntities({});
  let loadingAndFilteringStage = loadingStage;
  if (loadingStage === LoadingStage.AlgorithmsFinished && !isPending) {
    loadingAndFilteringStage = LoadingStage.FilterComplete;
  }
  const isFinished = loadingAndFilteringStage === LoadingStage.FilterComplete;

  return (
    <div
      aria-hidden={isFinished}
      className="LoadingStageDisplay align-center mt-4"
      style={{ color: isFinished ? 'var(--color-background)' : 'inherit' }}
    >
      Loading stage: {loadingAndFilteringStage + 1} of 6,{' '}
      {getLoadingStageLabel(loadingAndFilteringStage)}
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
    case LoadingStage.FilterComplete:
      return 'filtering complete';
    default:
      enforceExhaustiveSwitch(stage);
  }
}

export default LoadingStageDisplay;
