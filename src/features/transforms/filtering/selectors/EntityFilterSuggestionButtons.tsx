import React, { useEffect, useState } from 'react';

import { Suggestion } from '@features/params/Suggestion';
import usePageParams from '@features/params/usePageParams';

import { Button } from '@shared/ui/button';

type Props = {
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  onSubmit: (value: Suggestion) => void;
  currentID: string;
};

const EntityFilterSuggestionButtons: React.FC<Props> = ({
  getSuggestions,
  onSubmit,
  currentID,
}) => {
  // Create a state variable to store the suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // When component loads, call getSuggestions('') and store results
  const {
    languageFamilyFilter,
    languageFilter,
    languageScopes,
    territoryFilter,
    territoryScopes,
    writingSystemFilter,
  } = usePageParams();

  // When component loads, call getSuggestions('') and store results
  useEffect(() => {
    getSuggestions('').then((results) => {
      setSuggestions(results.slice(0, 8));
    });
  }, [
    getSuggestions,
    languageFamilyFilter,
    languageFilter,
    languageScopes,
    territoryFilter,
    territoryScopes,
    writingSystemFilter,
  ]);

  return (
    <div className="max-h-14 overflow-hidden">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.searchString}
          data-testid="entity-suggestion-button"
          onClick={() => onSubmit(suggestion)}
          variant={suggestion.entID === currentID ? 'secondary' : 'ghost'}
        >
          {suggestion.label}
        </Button>
      ))}
    </div>
  );
};

export default EntityFilterSuggestionButtons;
