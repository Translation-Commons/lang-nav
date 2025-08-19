import { XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { getPositionInGroup, PositionInGroup } from '../../generic/PositionInGroup';
import { useAutoAdjustedWidth } from '../../generic/useAutoAdjustedWidth';
import { PageParamKey, View } from '../../types/PageParamTypes';
import { usePageParams } from '../PageParamsContext';

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
        className={immediateValue === '' ? 'empty' : ''}
        value={immediateValue}
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
  const { objectID, searchString, label } = suggestion;
  const { updatePageParams, view } = usePageParams();

  const setFilter = () => {
    setImmediateValue(searchString);
  };
  const goToDetails = () => {
    updatePageParams({ objectID, view: View.Details, searchString });
  };
  const style = getOptionStyle(
    SelectorDisplay.Dropdown,
    false, // isSelected is always false here
    position,
  );

  if (view == View.Details && pageParameter === PageParamKey.searchString) {
    return (
      <HoverableButton
        hoverContent={<>Go to the details page for {searchString}</>}
        onClick={goToDetails}
        style={style}
      >
        {label}
      </HoverableButton>
    );
  }

  return (
    <button onClick={setFilter} style={style}>
      {label}
    </button>
  );
};

const ClearButton: React.FC<{
  onClick: () => void;
  display: SelectorDisplay;
}> = ({ onClick, display }) => {
  return (
    <HoverableButton
      hoverContent="Clear the input"
      style={{
        ...(display === SelectorDisplay.ButtonList
          ? { borderRadius: '0.5em', border: 'none' }
          : { marginRight: '0em', borderRadius: '0 1em 1em 0', borderLeft: 'none' }),
        padding: '0.5em',
      }}
      onClick={onClick}
    >
      <XIcon size="1em" display="block" />
    </HoverableButton>
  );
};

export default TextInput;
