import { XIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { getPositionInGroup, PositionInGroup } from '../../generic/PositionInGroup';
import { useAutoAdjustedWidth } from '../../generic/useAutoAdjustedWidth';
import { PageParamKey, View } from '../../types/PageParamTypes';
import { usePageParams } from '../PageParamsContext';

import { getOptionStyle, OptionsDisplay } from './Selector';

export type Suggestion = {
  objectID?: string;
  searchString: string;
  label: React.ReactNode;
};

type Props = {
  getSuggestions?: (query: string) => Promise<Suggestion[]>;
  inputStyle?: React.CSSProperties;
  onChange: (value: string) => void;
  optionsDisplay: OptionsDisplay;
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
  optionsDisplay,
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
        <div style={{ position: 'relative' }}>
          <div
            className="SelectorPopup"
            style={{
              background: 'var(--color-background)',
              border: 'none',
              borderRadius: '1em',
              alignItems: 'start',
              position: 'absolute',
              display: 'flex',
              left: '0px',
              flexDirection: 'column',
              width: 'fit-content',
              zIndex: 100,
            }}
          >
            {suggestions.map((s, i) => (
              <SuggestionRow
                key={i}
                pageParameter={pageParameter}
                position={getPositionInGroup(i, suggestions.length)}
                setImmediateValue={setImmediateValue}
                suggestion={s}
              />
            ))}
          </div>
        </div>
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
          ...(optionsDisplay === OptionsDisplay.ButtonList ? { borderRadius: '0.5em' } : {}),
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
        optionsDisplay={optionsDisplay}
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
    OptionsDisplay.Dropdown,
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
  optionsDisplay: OptionsDisplay;
}> = ({ onClick, optionsDisplay }) => {
  return (
    <HoverableButton
      hoverContent="Clear the input"
      style={
        optionsDisplay === OptionsDisplay.ButtonList
          ? { padding: '.5em', borderRadius: '0.5em', border: 'none', marginLeft: '0em' }
          : { marginRight: '0em', borderRadius: '0 1em 1em 0', borderLeft: 'none' }
      }
      onClick={onClick}
    >
      <XIcon size="1em" display="block" />
    </HoverableButton>
  );
};

export default TextInput;
