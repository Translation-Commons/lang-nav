import React, { useCallback } from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from '@widgets/controls/components/SelectorDisplayContext';
import SelectorLabel from '@widgets/controls/components/SelectorLabel';
import TextInput, { Suggestion } from '@widgets/controls/components/TextInput';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { PageParamKey, SearchableField } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import { getSortFunctionParameterized } from '@features/sorting/sort';
import { SortBy } from '@features/sorting/SortTypes';

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TextInput
            inputStyle={{ minWidth: '8em' }}
            getSuggestions={getSuggestions}
            onChange={(writingSystemFilter: string) => updatePageParams({ writingSystemFilter })}
            pageParameter={PageParamKey.writingSystemFilter}
            placeholder="Name or code"
            value={writingSystemFilter}
          />
        </div>
      </div>
    </SelectorDisplayProvider>
  );
};

export default WritingSystemFilterSelector;
