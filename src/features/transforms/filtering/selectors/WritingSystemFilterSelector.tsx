import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import { WritingSystemScope } from '@entities/writingsystem/WritingSystemTypes';

import { sortByPopulation } from '../../sorting/sort';
import { getSuggestionsFunction } from '../getSuggestionsFunction';

type Props = { display?: SelectorDisplay };

const WritingSystemFilterSelector: React.FC<Props> = ({ display: manualDisplay }) => {
  const { writingSystemFilter, updatePageParams } = usePageParams();
  const { writingSystems } = useDataContext();
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const getSuggestions = useMemo(() => {
    return getSuggestionsFunction(
      writingSystems.sort(sortByPopulation),
      (ws) => (ws.scope === WritingSystemScope.IndividualScript ? 0 : 1),
      (ws) => (ws.scope === WritingSystemScope.IndividualScript ? '' : 'other types of scripts'),
    );
  }, [writingSystems]);

  return (
    <SelectorDisplayProvider display={display}>
      <div className="selector" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <SelectorLabel
          label="Written in"
          description="Filter results by ones written in this script."
        />
        <TextInput
          inputStyle={{ minWidth: '8em' }}
          getSuggestions={getSuggestions}
          onSubmit={(writingSystemFilter: string) => updatePageParams({ writingSystemFilter })}
          pageParameter={PageParamKey.writingSystemFilter}
          placeholder="Name or code"
          value={writingSystemFilter}
        />
      </div>
    </SelectorDisplayProvider>
  );
};

export default WritingSystemFilterSelector;
