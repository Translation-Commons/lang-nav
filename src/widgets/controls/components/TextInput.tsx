import { XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import HoverableButton from '@features/hovercard/HoverableButton';
import { PageParamKey, View } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { useAutoAdjustedWidth } from '@shared/hooks/useAutoAdjustedWidth';
import { getPositionInGroup, PositionInGroup } from '@shared/lib/PositionInGroup';

import { SelectorDisplay } from './SelectorDisplay';
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
  onChange: (value: string) => void;
  display: SelectorDisplay;
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
  onChange,
  display,
  pageParameter,
  placeholder,
  value,
}) => {
  const { CalculateWidthFromHere, width } = useAutoAdjustedWidth(value);

  // Using a new variable immediateValue to allow users to edit the input box without causing computational
  // changes that could slow down rendering and cause a bad UX.
  const [immediateValue, setImmediateValue] = useState(value);
  useEffect(() => {
    // If the passed-in value of the text input changes (eg. on page nav) then update the immediate value
    // TODO: This does not always work
    setImmediateValue(value);
  }, [value, setImmediateValue]);

  // When the immediate value changes, it starts a timeout and after enough time it triggers onChange
  useEffect(() => {
    const timer = setTimeout(() => onChange(immediateValue), 300 /* ms */);
    return () => clearTimeout(timer);
  }, [immediateValue]);

  // Handle suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await getSuggestions(immediateValue);
      if (active) setSuggestions(result.slice(0, 10));
    })();
    return () => {
      active = false;
    };
  }, [getSuggestions, immediateValue]);

  return (
    <>
      {showSuggestions && suggestions.length > 0 && (
        <SelectorDropdown>
          {suggestions.map((s, i) => (
            <SuggestionRow
              key={i}
              pageParameter={pageParameter}
              position={getPositionInGroup(i, suggestions.length)}
              setImmediateValue={setImmediateValue}
              suggestion={s}
            />
          ))}
        </SelectorDropdown>
      )}
      <input
        type="text"
        id={pageParameter}
        className={immediateValue === '' ? 'empty' : ''}
        value={immediateValue}
        autoComplete="off" // It's already handled
        onChange={(ev) => {
          setImmediateValue(ev.target.value);
          setShowSuggestions(true);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        style={{
          borderRadius: display === SelectorDisplay.ButtonList ? '0.5em' : undefined,
          padding: '0.5em',
          lineHeight: '1.5em',
          ...inputStyle,
          width: width + 5,
        }}
      />
      {CalculateWidthFromHere}
      <ClearButton
        onClick={() => {
          setImmediateValue('');
          setShowSuggestions(false);
        }}
        display={display}
      />
    </>
  );
};

type SuggestionRowProps = {
  pageParameter?: PageParamKey;
  position?: PositionInGroup;
  setImmediateValue: (value: string) => void;
  suggestion: Suggestion;
};

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  pageParameter,
  position = PositionInGroup.Standalone,
  setImmediateValue,
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

  const setFilter = () => {
    setImmediateValue(suggestion.searchString);
  };

  return (
    <button onClick={setFilter} style={style} role="option" type="button">
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
  onClick: () => void;
  display: SelectorDisplay;
}> = ({ onClick, display }) => {
  return (
    <HoverableButton
      buttonType="reset"
      hoverContent="Clear the input"
      onClick={onClick}
      style={{
        ...(display === SelectorDisplay.ButtonList
          ? { borderRadius: '0.5em', border: 'none' }
          : { marginRight: '0em', borderRadius: '0 1em 1em 0', borderLeft: 'none' }),
        padding: '0.5em',
      }}
    >
      <XIcon size="1em" display="block" />
    </HoverableButton>
  );
};

export default TextInput;
