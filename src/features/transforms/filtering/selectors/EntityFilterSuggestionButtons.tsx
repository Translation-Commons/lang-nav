import React, { useEffect, useState } from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import SelectorOption from '@features/params/ui/SelectorOption';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';

type Props = {
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  onSubmit: (value: string) => void;
  value: string;
};

const EntityFilterSuggestionButtons: React.FC<Props> = ({ getSuggestions, onSubmit, value }) => {
  // Create a state variable to store the suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // When component loads, call getSuggestions('') and store results
  useEffect(() => {
    getSuggestions('').then((results) => {
      setSuggestions(results.slice(0, 5));
    });
  }, [getSuggestions]);

  return (
    <SelectorDisplayProvider display={SelectorDisplay.FilterList}>
      <div className="selector filterList">
        {suggestions.map((suggestion) => (
          <SelectorOption
            key={suggestion.searchString}
            option={suggestion.searchString}
            onClick={onSubmit}
            isSelected={suggestion.searchString === value}
            getOptionLabel={() => suggestion.label}
          />
        ))}
      </div>
    </SelectorDisplayProvider>
  );
};

export default EntityFilterSuggestionButtons;
