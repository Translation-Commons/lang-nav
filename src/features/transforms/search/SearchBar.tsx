import { SearchIcon } from 'lucide-react';
import React, { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { PageParamKey } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import TextInput from '@features/params/ui/TextInput';
import usePageParams from '@features/params/usePageParams';

import useSearchSuggestions from './useSearchSuggestions';

const SearchBar: React.FC = () => {
  const { searchString, updatePageParams } = usePageParams();
  const location = useLocation();
  const getSearchSuggestions = useSearchSuggestions();
  const setSearchString = useCallback(
    (value: string) => {
      // Only update the searchString param if we're already on the data page
      if (location.pathname === '/data') updatePageParams({ searchString: value });
    },
    [updatePageParams],
  );
  return (
    <SelectorDisplayProvider display={SelectorDisplay.ButtonList}>
      <form
        className="selector"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          margin: '0 auto',
          borderRadius: '1em',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <TextInput
          label={
            <SearchIcon
              size="1em"
              display="block"
              style={{ padding: '0.5em', color: 'var(--color-text)' }}
            />
          }
          inputStyle={{
            minWidth: '20em',
            border: 'none',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text)',
            outline: 'none',
          }}
          getSuggestions={getSearchSuggestions}
          onSubmit={setSearchString}
          placeholder="search"
          pageParameter={PageParamKey.searchString}
          value={searchString}
        />
      </form>
    </SelectorDisplayProvider>
  );
};

export default SearchBar;
