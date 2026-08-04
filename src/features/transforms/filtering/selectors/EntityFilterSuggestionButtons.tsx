import SelectorOption from '@features/params/ui/SelectorOption';
import { Suggestion } from '@features/params/ui/SelectorSuggestions';
import usePageParams from '@features/params/usePageParams';
import React, { useEffect, useState } from 'react';


type Props = {
    getSuggestions: (query: string) => Promise<Suggestion[]>;
    onSubmit: (value: string) => void;
    value: string;
};

const EntityFilterSuggestionButtons: React.FC<Props> = ({ getSuggestions, onSubmit, value }) => {
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
            setSuggestions(results.slice(0, 5));
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

    return (suggestions.map((suggestion) => (
        <SelectorOption optionStyle={{ marginLeft: '1em' }}
            key={suggestion.searchString}
            option={suggestion.searchString}
            onClick={onSubmit}
            isSelected={suggestion.searchString === value}
            getOptionLabel={() => suggestion.label}
        />
    ))
    );
};

export default EntityFilterSuggestionButtons;
