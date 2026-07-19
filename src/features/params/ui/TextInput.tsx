import { XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { PageParamKey } from '@features/params/PageParamTypes';

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@shared/ui/combobox';
import { InputGroupAddon, InputGroupButton } from '@shared/ui/input-group';

import { Suggestion, SUGGESTION_LIMIT } from './SelectorSuggestions';

// Lets callers distinguish a clicked suggestion from a typed query.
export type TextInputSubmitSource = 'input' | 'clear' | 'suggestion';

type Props = {
  getSuggestions?: (query: string) => Promise<Suggestion[]>;
  inputStyle?: React.CSSProperties;
  label?: React.ReactNode;
  onSubmit: (value: string, source?: TextInputSubmitSource) => void;
  pageParameter?: PageParamKey;
  placeholder?: string;
  value: string;
};

const TextInput: React.FC<Props> = ({
  getSuggestions = async () => [],
  inputStyle,
  label,
  onSubmit,
  pageParameter,
  placeholder,
  value,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isUpdatingFromSuggestions = useRef(false);

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
      // Race guard: a suggestion press sets the ref before the input blurs, so
      // the blur-submit is skipped and the suggestion selection wins.
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
      submit(suggestion.searchString, 'suggestion');
    },
    [submit],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      isUpdatingFromSuggestions.current = false;
      if (event.key === 'Enter') {
        // Always submit the typed free text (filters accept values with no matching suggestion).
        event.preventDefault();
        submit(currentValue, 'input');
      } else if (event.key === 'Escape') {
        // Revert the edits without committing.
        event.preventDefault();
        setCurrentValue(value);
        setShowSuggestions(false);
      } else {
        setShowSuggestions(true);
      }
    },
    [currentValue, submit, value],
  );

  const onClear = useCallback(() => {
    setCurrentValue('');
    submit('', 'clear');
  }, [submit]);

  const isOpen = showSuggestions && suggestions.length > 0;

  return (
    <div className="flex items-center gap-1">
      {label}
      <Combobox<Suggestion, false>
        value={null}
        onValueChange={(suggestion) => {
          if (suggestion) selectSuggestion(suggestion);
        }}
        inputValue={currentValue}
        onInputValueChange={(next, details) => {
          // Filters keep the typed free text: ignore Base UI's automatic input resets
          // on Escape (handled in onKeyDown) and on close when nothing matches ('input-clear').
          if (details.reason === 'escape-key' || details.reason === 'input-clear') return;
          setCurrentValue(next);
        }}
        open={isOpen}
        onOpenChange={(open) => setShowSuggestions(open)}
        filter={null}
        itemToStringLabel={(suggestion) => suggestion.searchString}
        itemToStringValue={(suggestion) => suggestion.searchString}
      >
        <ComboboxInput
          id={pageParameter}
          className="bg-background text-foreground dark:bg-background"
          placeholder={placeholder}
          showTrigger={false}
          showClear={false}
          style={inputStyle}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => submit(currentValue, 'input')}
          onKeyDown={onKeyDown}
        >
          {currentValue !== '' && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="Clear the input"
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClear}
              >
                <XIcon />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </ComboboxInput>
        <ComboboxContent className="min-w-40">
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Pick a suggestion
            {currentValue !== ''
              ? ` or press [enter] to filter by "${currentValue}"`
              : ' or type to filter'}
          </div>
          <ComboboxList>
            {suggestions.map((suggestion, i) => (
              <React.Fragment key={i}>
                {i > 0 && suggestions[i - 1].group !== suggestion.group && (
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    {suggestion.group}
                  </div>
                )}
                <ComboboxItem
                  value={suggestion}
                  onMouseDown={() => (isUpdatingFromSuggestions.current = true)}
                >
                  {suggestion.label}
                </ComboboxItem>
              </React.Fragment>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export default TextInput;
