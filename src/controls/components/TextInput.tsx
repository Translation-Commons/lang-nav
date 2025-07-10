import { SearchIcon, ExternalLinkIcon, XIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { View } from '../../types/PageParamTypes';
import { usePageParams } from '../PageParamsContext';

export type Suggestion = {
  objectID?: string;
  searchString: string;
  label: React.ReactNode;
};

type Props = {
  inputStyle?: React.CSSProperties;
  getSuggestions?: (query: string) => Promise<Suggestion[]>;
  onChange: (value: string) => void;
  showGoToDetailsButton?: boolean;
  showTextInputButton?: boolean;
  placeholder?: string;
  value: string;
};

const TextInput: React.FC<Props> = ({
  inputStyle,
  getSuggestions = () => [],
  onChange,
  showGoToDetailsButton = false,
  showTextInputButton = true,
  placeholder,
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
        style={{ ...inputStyle, width: inputWidth + 5 }}
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
      {showSuggestions && suggestions.length > 0 && (
        <div className="SelectorPopupAnchor">
          <div className="SelectorPopup">
            {suggestions.map((s, i) => (
              <SuggestionRow
                key={i}
                setImmediateValue={setImmediateValue}
                setShowSuggestions={setShowSuggestions}
                showTextInputButton={showTextInputButton}
                showGoToDetailsButton={showGoToDetailsButton}
                suggestion={s}
              />
            ))}
          </div>
        </div>
      )}
      <button
        className="NoLeftBorder"
        type="button"
        onClick={() => {
          setImmediateValue('');
          setShowSuggestions(false);
        }}
      >
        <XIcon size="1em" display="block" />
      </button>
    </>
  );
};

type SuggestionRowProps = {
  setImmediateValue: (value: string) => void;
  setShowSuggestions: (show: boolean) => void;
  showGoToDetailsButton?: boolean;
  showTextInputButton?: boolean;
  suggestion: Suggestion;
};

const SuggestionRow: React.FC<SuggestionRowProps> = ({
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

  // Some simplier states if we have 1 button
  if (!showGoToDetailsButton) {
    if (!showTextInputButton) {
      return label;
    }
    return <button onClick={setFilter}>{label}</button>;
  }
  if (!showTextInputButton) {
    return (
      <HoverableButton
        hoverContent={<>Go to the details page for {searchString}</>}
        onClick={goToDetails}
      >
        {label}
      </HoverableButton>
    );
  }

  // The more complex case, where we have 2 buttons
  return (
    <div className="SuggestionRowWithMultipleInteractions">
      <div>{label}</div>
      <HoverableButton hoverContent={<>Filter by &quot;{searchString}&quot;</>} onClick={setFilter}>
        <SearchIcon size="1em" display="block" />
      </HoverableButton>
      <HoverableButton
        hoverContent={<>Go to the details page for {searchString}</>}
        onClick={goToDetails}
      >
        <ExternalLinkIcon size="1em" display="block" />
      </HoverableButton>
    </div>
  );
};

export default TextInput;
