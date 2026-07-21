import { SearchIcon, XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { getNewURLSearchParams } from '@features/params/getNewURLSearchParams';
import { Suggestion, SUGGESTION_LIMIT } from '@features/params/ui/SelectorSuggestions';
import { TextInputSubmitSource } from '@features/params/ui/TextInput';

import { Command, CommandEmpty, CommandItem, CommandList } from '@shared/ui/command';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@shared/ui/input-group';

type Props = {
  getSuggestions: (query: string) => Promise<Suggestion[]>;
  onSubmit: (value: string, source?: TextInputSubmitSource) => void;
  placeholder?: string;
  value: string;
};

const SUGGESTION_LIST_ID = 'suggestion-list';

const SearchCombobox: React.FC<Props> = ({ getSuggestions, onSubmit, placeholder, value }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isUpdatingFromSuggestions = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [oldParams] = useSearchParams();

  useEffect(() => {
    // Keep in sync when the committed value changes (eg. on navigation).
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    let active = true;
    (async () => {
      const next = await getSuggestions(currentValue);
      if (active) setSuggestions(next.slice(0, SUGGESTION_LIMIT));
    })();
    return () => {
      active = false;
    };
  }, [getSuggestions, currentValue]);

  const submit = useCallback(
    (nextValue: string, source: TextInputSubmitSource) => {
      // Race guard: a suggestion click sets the ref before the input blurs, so
      // the blur-submit is skipped and the suggestion navigation wins.
      if (source !== 'suggestion' && isUpdatingFromSuggestions.current) return;
      onSubmit(nextValue, source);
      // Delay hiding so suggestion clicks land before the panel unmounts.
      setTimeout(() => {
        setShowSuggestions(false);
        setCurrentValue(nextValue);
        isUpdatingFromSuggestions.current = false;
      }, 200);
    },
    [onSubmit],
  );

  const selectSuggestion = useCallback(
    (suggestion: Suggestion) => {
      isUpdatingFromSuggestions.current = true;
      onSubmit(suggestion.searchString, 'suggestion');
      const paramsStr =
        '?' +
        getNewURLSearchParams(
          { objectID: suggestion.objectID, searchString: suggestion.searchString },
          oldParams,
        );
      navigate(['/', LangNavPageName.Data, paramsStr].join(''));
      setShowSuggestions(false);
    },
    [navigate, oldParams, onSubmit],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      isUpdatingFromSuggestions.current = false;
      setShowSuggestions(true);
      if (event.key === 'Enter') {
        event.preventDefault();
        submit(currentValue, 'input');
      } else if (event.key === 'Escape') {
        setCurrentValue(value);
        setShowSuggestions(false);
      }
    },
    [currentValue, submit, value],
  );

  const onClear = useCallback(() => {
    setCurrentValue('');
    onSubmit('', 'clear');
    inputRef.current?.focus();
  }, [onSubmit]);

  const isOpen = showSuggestions && (suggestions.length > 0 || currentValue !== '');

  return (
    <div className="relative mx-auto w-80 max-w-full">
      <InputGroup className="bg-background text-foreground dark:bg-background">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={SUGGESTION_LIST_ID}
          autoComplete="off"
          onBlur={() => submit(currentValue, 'input')}
          onChange={(ev) => setCurrentValue(ev.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          value={currentValue}
        />
        {currentValue !== '' && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onClear}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      {isOpen && (
        <Command
          shouldFilter={false}
          id={SUGGESTION_LIST_ID}
          className="absolute z-[92] mt-1 h-auto w-full border border-border shadow-md"
        >
          <CommandList>
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Pick a suggestion
              {currentValue !== ''
                ? ` or press [enter] to filter by "${currentValue}"`
                : ' or type to filter'}
            </div>
            <CommandEmpty>No matches</CommandEmpty>
            {suggestions.map((suggestion, i) => (
              <React.Fragment key={i}>
                {i > 0 && suggestions[i - 1].group !== suggestion.group && (
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {suggestion.group}
                  </div>
                )}
                <CommandItem
                  value={`${suggestion.objectID ?? suggestion.searchString}-${i}`}
                  onMouseDown={() => (isUpdatingFromSuggestions.current = true)}
                  onSelect={() => selectSuggestion(suggestion)}
                >
                  {suggestion.label}
                </CommandItem>
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      )}
    </div>
  );
};

export default SearchCombobox;
