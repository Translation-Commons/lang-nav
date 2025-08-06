import { ExternalLinkIcon, XIcon, FilterIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { getPositionInGroup, PositionInGroup } from '../../generic/PositionInGroup';
import { View } from '../../types/PageParamTypes';
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
  placeholder?: string;
  showGoToDetailsButton?: boolean;
  showTextInputButton?: boolean;
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
  placeholder,
  showGoToDetailsButton = false,
  showTextInputButton = true,
  value,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(50);

  // Used to calculate the width of the input box
  useEffect(() => {
    if (spanRef.current) {
      setInputWidth(spanRef.current.offsetWidth + 10); // add some buffer
    }
  }, [value]);

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
                position={getPositionInGroup(i, suggestions.length)}
                setImmediateValue={setImmediateValue}
                showTextInputButton={showTextInputButton}
                showGoToDetailsButton={showGoToDetailsButton}
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
          width: inputWidth + 5,
        }}
      />
      <span
        ref={spanRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          font: 'inherit',
        }}
      >
        {value || ' '}
      </span>
      <HoverableButton
        hoverContent="Clear the input"
        style={
          optionsDisplay === OptionsDisplay.ButtonList
            ? { padding: '.5em', borderRadius: '0.5em', border: 'none', marginLeft: '0.5em' }
            : {
                marginRight: '0em',
                borderTopLeftRadius: '0px',
                borderBottomLeftRadius: '0px',
                borderLeft: 'none',
              }
        }
        onClick={() => {
          setImmediateValue('');
          setShowSuggestions(false);
        }}
      >
        <XIcon size="1em" display="block" />
      </HoverableButton>
    </>
  );
};

type SuggestionRowProps = {
  position?: PositionInGroup;
  setImmediateValue: (value: string) => void;
  showGoToDetailsButton?: boolean;
  showTextInputButton?: boolean;
  suggestion: Suggestion;
};

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  position = PositionInGroup.Standalone,
  setImmediateValue,
  showGoToDetailsButton,
  showTextInputButton,
  suggestion,
}) => {
  const { objectID, searchString, label } = suggestion;
  const { updatePageParams } = usePageParams();

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

  // Some simplier states if we have 1 button
  if (!showGoToDetailsButton) {
    if (!showTextInputButton) {
      return label;
    }
    return (
      <button onClick={setFilter} style={style}>
        {label}
      </button>
    );
  }
  if (!showTextInputButton) {
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

  // The more complex case, where we have 2 buttons
  return (
    <div
      className="SuggestionRowWithMultipleInteractions"
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '0.125em',
        justifyContent: 'end',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <div
        style={{
          whiteSpace: 'nowrap',
          maxWidth: '12em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          paddingLeft: '1em',
          margin: 'none',
        }}
      >
        {label}
      </div>
      <HoverableButton
        hoverContent={<>Filter by &quot;{searchString}&quot;</>}
        onClick={setFilter}
        style={{ width: 'fit-content' }}
      >
        <FilterIcon size="1em" display="block" />
      </HoverableButton>
      <HoverableButton
        hoverContent={<>Go to the details page for {searchString}</>}
        onClick={goToDetails}
        style={{ width: 'fit-content' }}
      >
        <ExternalLinkIcon size="1em" display="block" />
      </HoverableButton>
    </div>
  );
};

export default TextInput;
