import React, { useMemo } from 'react';

import { useDataContext } from '@features/data-loading/context/useDataContext';
import { getScopeFilter } from '@features/filtering/filter';
import { PageParamKey, SearchableField } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { getSearchableField, HighlightedObjectField } from '@entities/ui/ObjectField';

import { SelectorDisplay } from '../components/SelectorDisplay';
import SelectorLabel from '../components/SelectorLabel';
import TextInput, { Suggestion } from '../components/TextInput';

const TerritoryFilterSelector: React.FC = () => {
  const { territoryFilter, updatePageParams } = usePageParams();
  const { territories } = useDataContext();
  const filterByScope = getScopeFilter();

  const getSuggestions = useMemo(() => {
    return async (query: string): Promise<Suggestion[]> => {
      const lowerCaseQuery = query.toLowerCase();
      return territories
        .filter(filterByScope)
        .filter((territory) =>
          getSearchableField(territory, SearchableField.NameOrCode)
            .toLowerCase()
            .split(/\W/g)
            .some((word) => word.startsWith(lowerCaseQuery)),
        )
        .map((object) => {
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
    };
  }, [territories, filterByScope]);

  return (
    <div className="selector" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <SelectorLabel
        display={SelectorDisplay.ButtonList}
        label="Relevant to Territory"
        description="Filter results by ones relevant in a territory."
      />
      <TextInput
        inputStyle={{ minWidth: '8em', marginLeft: '2em' }}
        display={SelectorDisplay.ButtonList}
        getSuggestions={getSuggestions}
        onChange={(territoryFilter: string) => updatePageParams({ territoryFilter })}
        pageParameter={PageParamKey.territoryFilter}
        placeholder="Name or code"
        value={territoryFilter}
      />
    </div>
  );
};

export default TerritoryFilterSelector;
