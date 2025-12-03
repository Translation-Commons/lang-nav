import { XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import { PageParamKey, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { useAutoAdjustedWidth } from '@shared/hooks/useAutoAdjustedWidth';
import { getPositionInGroup, PositionInGroup } from '@shared/lib/PositionInGroup';

import { SelectorDisplay, useSelectorDisplay } from './SelectorDisplayContext';
import { SelectorDropdown } from './SelectorDropdown';
import { getOptionStyle } from './SelectorOption';

export type Suggestion = {
  objectID?: string;
  searchString: string;
  label: React.ReactNode;
};

type Props = {
  getSuggestions?: (query: string) => Promise<Suggestion[]>;
  inputStyle?: React.CSSProperties;
  label?: React.ReactNode;
  onSubmit: (value: string) => void;
  pageParameter?: PageParamKey;
  placeholder?: string;
  value: string;
};

/*
 * Known issues: This component uses useEffect to debounce inputs and to update the field
 * if it is updated in another place -- but there still seems to be an issue and it may
 * cause the history to be reset. Adding 2 TextInputs on the same page may freeze the page.
 */
const TextInput: React.FC<Props> = ({
  getSuggestions = () => [],
  inputStyle,
  label,
  onSubmit,
  pageParameter,
  placeholder,
  value,
}) => {
  const { CalculateWidthFromHere, width } = useAutoAdjustedWidth(value);

  // Using a new variable currentValue to allow users to edit the input box without causing computational
  // changes that could slow down rendering and cause a bad UX.
  const [currentValue, setCurrentValue] = useState(value);
  useEffect(() => {
    // If the passed-in value of the text input changes (eg. on page nav) then update the current value
    setCurrentValue(value);
  }, [value, setCurrentValue]);

  // Handle suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getSuggestions(currentValue);
      if (active) setSuggestions(result.slice(0, 10));
    })();
    return () => {
      active = false;
    };
  }, [getSuggestions, currentValue]);
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSubmit(currentValue);
        setIsActive(false);
      }
    },
    [onSubmit, currentValue],
  );
  const onClear = useCallback(() => {
    onSubmit('');
    setIsActive(false);
  }, [onSubmit]);

  return (
    <div
      // onSubmit={onEnterKey}
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '.75em',
        border: '0.125em solid var(--color-button-primary)',
      }}
    >
      {label}
      {isActive && suggestions.length > 0 && (
        <SelectorDropdown>
          {suggestions.map((s, i) => (
            <SuggestionRow
              key={i}
              pageParameter={pageParameter}
              position={getPositionInGroup(i, suggestions.length)}
              onSubmit={onSubmit}
              suggestion={s}
            />
          ))}
        </SelectorDropdown>
      )}
      <input
        onSubmit={() => onSubmit(currentValue)}
        onKeyDown={onKeyDown}
        type="text"
        id={pageParameter}
        className={currentValue === '' ? 'empty' : ''}
        value={currentValue}
        autoComplete="off" // It's already handled
        onChange={(ev) => {
          setCurrentValue(ev.target.value);
          setIsActive(true);
        }}
        onBlur={() => {
          // Wait. If we do it immediately, the onClick of the suggestion won't register
          const timer = setTimeout(() => setIsActive(false), 100);
          return () => clearTimeout(timer);
        }}
        onFocus={() => setIsActive(true)}
        placeholder={placeholder}
        style={{
          borderRadius: '0.75em',
          borderWidth: 0,
          padding: '0.5em',
          lineHeight: '1.5em',
          ...inputStyle,
          width: width + 5,
        }}
      />
      {CalculateWidthFromHere}
      <ClearButton onClear={onClear} />
    </div>
  );
};

type SuggestionRowProps = {
  pageParameter?: PageParamKey;
  position?: PositionInGroup;
  onSubmit: (value: string) => void;
  suggestion: Suggestion;
};

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  pageParameter,
  position = PositionInGroup.Standalone,
  onSubmit,
  suggestion,
}) => {
  const { view } = usePageParams();
  const style = getOptionStyle(
    SelectorDisplay.Dropdown,
    false, // isSelected is always false here
    position,
  );
  if (view == View.Details && pageParameter === PageParamKey.searchString) {
    return <SuggestionRowDetails suggestion={suggestion} style={style} />;
  }

  const onClick = useCallback(() => {
    onSubmit(suggestion.searchString);
  }, [onSubmit, suggestion.searchString]);

  return (
    <button onClick={onClick} style={style} role="option" type="button">
      {suggestion.label}
    </button>
  );
};

const SuggestionRowDetails: React.FC<{
  suggestion: Suggestion;
  style?: React.CSSProperties;
}> = ({ style, suggestion }) => {
  const { objectID, searchString, label } = suggestion;
  const { updatePageParams } = usePageParams();

  const goToDetails = () => {
    updatePageParams({ objectID, view: View.Details, searchString });
  };

  return (
    <HoverableButton
      hoverContent={<>Go to the details page for {searchString}</>}
      onClick={goToDetails}
      style={style}
    >
      {label}
    </HoverableButton>
  );
};

const ClearButton: React.FC<{
  onClear: () => void;
}> = ({ onClear }) => {
  const { display } = useSelectorDisplay();
  return (
    <HoverableButton
      buttonType="button"
      hoverContent="Clear the input"
      onClick={onClear}
      style={{
        ...(display === SelectorDisplay.ButtonList
          ? { borderRadius: '0.5em', border: 'none' }
          : { marginRight: '0em', borderRadius: '0 1em 1em 0', borderLeft: 'none' }),
        marginLeft: '0em',
        padding: '0.5em',
      }}
    >
      <XIcon size="1em" display="block" />
    </HoverableButton>
  );
};

export default TextInput;
