import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { sortByPopulation } from '../../sorting/sort';
import { getSuggestionsFunction } from '../getSuggestionsFunction';

import EntityFilterSelector from './EntityFilterSelector';

type Props = { display?: SelectorDisplay };

const WritingSystemFilterSelector: React.FC<Props> = ({ display }) => {
  const { writingSystemFilter, updatePageParams } = usePageParams();
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
      display={display}
      getSuggestions={getSuggestions}
      selectorLabel="Written in"
      selectorDescription="Filter results by ones written in this script."
      onSubmit={(writingSystemFilter: string) => updatePageParams({ writingSystemFilter })}
      value={writingSystemFilter}
      pageParameter={PageParamKey.writingSystemFilter}
    />
  );
};

export default WritingSystemFilterSelector;
