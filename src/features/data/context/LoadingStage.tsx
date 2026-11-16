enum LoadingStage {
  Initial,
  HasCoreData,
  HasSupplementalData,
  RecomputingAlgorithms,
  AlgorithmsFinished,
  FilterComplete, // Not from data context, rather useFilteredEntities
}

export default LoadingStage;
