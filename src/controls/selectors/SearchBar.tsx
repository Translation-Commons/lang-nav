import { SearchIcon } from 'lucide-react';
import React from 'react';

import { PageParamKey } from '../../types/PageParamTypes';
import { SelectorDisplay } from '../components/SelectorDisplay';
import TextInput from '../components/TextInput';
import { usePageParams } from '../PageParamsContext';

import SearchBySelector from './SearchBySelector';
import { useSearchSuggestions } from './useSearchSuggestions';

const SearchBar: React.FC = () => {
  const { searchString, updatePageParams } = usePageParams();
  const getSearchSuggestions = useSearchSuggestions();
  const border = '0.125em solid var(--color-button-primary)';

  return (
    <div
      className="selector"
      style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}
    >
      <div
        style={{ marginRight: '-0.125em', border, padding: '0.5em', borderRadius: '1em 0 0 1em' }}
      >
        <SearchIcon size="1em" display="block" />
      </div>
      <TextInput
        inputStyle={{ minWidth: '20em', marginRight: '-0.125em', borderRight: 'none' }}
        getSuggestions={getSearchSuggestions}
        onChange={(searchString: string) => updatePageParams({ searchString })}
        display={SelectorDisplay.ButtonGroup}
        placeholder="search"
        pageParameter={PageParamKey.searchString}
        value={searchString}
      />
      <SearchBySelector />
    </div>
  );
};

export default SearchBar;
