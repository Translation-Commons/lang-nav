import React, { useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import { PageParamKey, SearchableField } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import TextInput, { Suggestion } from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';
import { getSortFunctionParameterized } from '@features/transforms/sorting/sort';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { getSearchableField, HighlightedObjectField } from '@entities/ui/ObjectField';

type Props = { display?: SelectorDisplay };

const WritingSystemFilterSelector: React.FC<Props> = ({ display: manualDisplay }) => {
  const { writingSystemFilter, updatePageParams } = usePageParams();
  const { writingSystems } = useDataContext();
  const sortFunction = getSortFunctionParameterized(SortBy.Population);
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const getSuggestions = useCallback(
    async (query: string): Promise<Suggestion[]> => {
      const lowerCaseQuery = query.toLowerCase();
      const filteredScripts = writingSystems
        .filter((ws) =>
          getSearchableField(ws, SearchableField.NameOrCode)
            .toLowerCase()
            .split(/\W/g)
            .some((word) => word.startsWith(lowerCaseQuery)),
        )
        .sort(sortFunction);
      return filteredScripts.map((object) => {
        const label = (
          <HighlightedObjectField
            object={object}
            field={SearchableField.NameOrCode}
            query={query}
          />
        );
        const searchString = getSearchableField(object, SearchableField.NameOrCode);
        return { objectID: object.ID, searchString, label };
      });
    },
    [writingSystems, sortFunction],
  );

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
