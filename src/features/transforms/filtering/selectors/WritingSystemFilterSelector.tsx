import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';

import { WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { sortByPopulation } from '../../sorting/sort';
import { getSuggestionsFunction } from '../getSuggestionsFunction';

import EntityFilterSelector from './EntityFilterSelector';

const WritingSystemFilterSelector: React.FC = () => {
  const { writingSystems } = useDataContext();

  const getSuggestions = useMemo(() => {
    return getSuggestionsFunction(
      writingSystems.slice().sort(sortByPopulation),
      (ws) => (ws.scope === WritingSystemScope.IndividualScript ? 0 : 1),
      (ws) => (ws.scope === WritingSystemScope.IndividualScript ? '' : 'other types of scripts'),
    );
  }, [writingSystems]);

  return (
    <EntityFilterSelector
      getSuggestions={getSuggestions}
      selectorLabel="Written in"
      selectorDescription="Filter results by ones written in this script."
      pageParameter={PageParamKey.writingSystemFilter}
    />
  );
};

export default WritingSystemFilterSelector;
