import { SearchIcon } from 'lucide-react';
import React from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import SearchBySelector from './SearchBySelector';
import { useSearchSuggestions } from './useSearchSuggestions';

const SearchBar: React.FC = () => {
  const { searchString, updatePageParams } = usePageParams();
  const getSearchSuggestions = useSearchSuggestions();
  const setSearchString = (value: string) => {
    updatePageParams({ searchString: value });
  };

  return (
    <SelectorDisplayProvider display={SelectorDisplay.ButtonList}>
      <form
        className="selector"
        style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '0.5em' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '.75em',
            border: '0.125em solid var(--color-button-primary)',
          }}
        >
          <SearchIcon size="1em" display="block" style={{ padding: '0.5em' }} />
          <TextInput
            inputStyle={{ minWidth: '20em', border: 'none' }}
            getSuggestions={getSearchSuggestions}
            onChange={setSearchString}
            placeholder="search"
            pageParameter={PageParamKey.searchString}
            value={searchString}
          />
        </div>
        <SearchBySelector />
      </form>
    </SelectorDisplayProvider>
  );
};

export default SearchBar;
