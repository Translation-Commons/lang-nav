import { SearchIcon } from 'lucide-react';
import React from 'react';

import { SearchableField, View } from '../../types/PageParamTypes';
import { OptionsDisplay } from '../components/Selector';
import SingleChoiceOptions from '../components/SingleChoiceOptions';
import TextInput from '../components/TextInput';
import { usePageParams } from '../PageParamsContext';

import { useSearchSuggestions } from './useSearchSuggestions';

const SearchBar: React.FC = () => {
  const { searchBy, searchString, updatePageParams, view } = usePageParams();
  const getSearchSuggestions = useSearchSuggestions();
  const border = '0.125em solid var(--color-button-primary)';

  return (
    <div
      className="selector"
      style={{
        display: 'flex',
        alignItems: 'end',
        marginBottom: '0.5em',
      }}
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
        optionsDisplay={OptionsDisplay.ButtonGroup}
        placeholder="search"
        showGoToDetailsButton={true}
        showTextInputButton={view !== View.Details}
        value={searchString}
      />
      <label
        style={{
          marginLeft: '-0.125em',
          marginRight: '-0.125em',
          border,
          borderLeft: 'none',
          padding: '0.5em',
        }}
      >
        on
      </label>
      <SingleChoiceOptions<SearchableField>
        onChange={(searchBy: SearchableField) => updatePageParams({ searchBy })}
        options={Object.values(SearchableField)}
        selected={searchBy}
        style={{ borderRadius: '0 1em 1em 0' }}
      />
    </div>
  );
};

export default SearchBar;
