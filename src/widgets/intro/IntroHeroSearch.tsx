import { SearchIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import LoadingStage from '@features/data/context/LoadingStage';
import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType, View } from '@features/params/PageParamTypes';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParamNavigation from '@features/params/usePageParamNavigation';
import EntitySearchCombobox from '@features/transforms/search/EntitySearchCombobox';
import useIntroSearchSuggestions from '@features/transforms/search/useIntroSearchSuggestions';

import { Button } from '@shared/ui/button';
import { ButtonGroup } from '@shared/ui/button-group';

const IntroHeroSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const { loadingStage } = useDataContext();
  const getSuggestions = useIntroSearchSuggestions();
  const openDataPage = usePageParamNavigation({});
  const openLuckySearch = usePageParamNavigation({ page: LangNavPageName.Lucky });
  const isLoading = loadingStage < LoadingStage.HasCoreData;

  const onSelect = useCallback(
    (value: Suggestion) => {
      if (value.ent?.type === EntityType.Territory) {
        openDataPage({
          entType: EntityType.Locale,
          view: View.Table,
          territoryFilter: value.entID,
        });
      } else {
        openDataPage({ entType: EntityType.Language, entID: value.entID });
      }
    },
    [openDataPage],
  );

  return (
    <ButtonGroup className="w-full" aria-label="Search languages and countries">
      <EntitySearchCombobox
        getSuggestions={getSuggestions}
        onSelect={onSelect}
        onQueryChange={setQuery}
        placeholder="Search a language or a country"
        ariaLabel="Search a language or a country"
        emptyMessage={isLoading ? 'Loading languages and countries...' : 'No matches'}
        className="h-9 min-w-0 flex-1 text-sm"
      />
      <Button
        size="lg"
        className="h-9 px-4 text-sm"
        disabled={!query}
        onClick={() => openLuckySearch({ searchString: query })}
      >
        <SearchIcon />
        Search
      </Button>
    </ButtonGroup>
  );
};

export default IntroHeroSearch;
