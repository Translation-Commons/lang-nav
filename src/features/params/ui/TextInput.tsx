import { XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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

const enum SubmissionSource {
  InputBox,
  ClearButton,
  Suggestion,
}

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
  const isUpdatingFromSuggestions = useRef(false);

  // Handle suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const submit = useCallback(
    (value: string, source: SubmissionSource) => {
      if (source !== SubmissionSource.Suggestion && isUpdatingFromSuggestions.current) return;
      onSubmit(value);

      // Hide suggestions after submission, with a slight delay to allow click events to register
      const timer = setTimeout(() => {
        {
          setShowSuggestions(false);
          isUpdatingFromSuggestions.current = false;
        }
      }, 100);
      return () => clearTimeout(timer);
    },
    [onSubmit, setShowSuggestions],
  );

  useEffect(() => {
    let active = true;
    // Only keep the latest request for suggestions
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
      isUpdatingFromSuggestions.current = false;
      setShowSuggestions(true);
      if (event.key === 'Enter') {
        // Prevent the page from reloading, and do a regular submit
        event.preventDefault();
        submit(currentValue, SubmissionSource.InputBox);
      } else if (event.key === 'Escape') {
        // Undoes the edits
        setCurrentValue(value);
        setShowSuggestions(false);
      }
    },
    [submit, currentValue, setShowSuggestions],
  );
  const onClickSuggestion = useCallback(
    (suggestion: Suggestion) => {
      isUpdatingFromSuggestions.current = true;
      submit(suggestion.searchString, SubmissionSource.Suggestion);
    },
    [submit],
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '.75em',
        border: '0.125em solid var(--color-button-primary)',
      }}
    >
      {label}
      {showSuggestions && suggestions.length > 0 && (
        <SelectorDropdown>
          {suggestions.map((s, i) => (
            <SuggestionRow
              key={i}
              pageParameter={pageParameter}
              position={getPositionInGroup(i, suggestions.length)}
              onClick={onClickSuggestion}
              onKeyDown={() => (isUpdatingFromSuggestions.current = true)}
              suggestion={s}
            />
          ))}
        </SelectorDropdown>
      )}
      <input
        type="text"
        id={pageParameter}
        className={currentValue === '' ? 'empty' : ''}
        value={currentValue}
        autoComplete="off" // It's already handled
        onChange={(ev) => setCurrentValue(ev.target.value)}
        onBlur={() => submit(currentValue, SubmissionSource.InputBox)}
        onFocus={() => setShowSuggestions(true)}
        onKeyDown={onKeyDown} // If enter key, submit
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
      <ClearButton onClear={() => submit('', SubmissionSource.ClearButton)} />
    </div>
  );
};

type SuggestionRowProps = {
  pageParameter?: PageParamKey;
  position?: PositionInGroup;
  onClick: (value: Suggestion) => void;
  onKeyDown: () => void;
  suggestion: Suggestion;
};

const SuggestionRow: React.FC<SuggestionRowProps> = ({
  pageParameter,
  position = PositionInGroup.Standalone,
  onClick,
  onKeyDown,
  suggestion,
}) => {
  const { view } = usePageParams();
  const style = getOptionStyle(
    SelectorDisplay.Dropdown,
    false, // isSelected is always false here
    position,
  );
  if (view == View.Details && pageParameter === PageParamKey.searchString) {
    // Does not need to update suggestions
    return <SuggestionRowDetails suggestion={suggestion} style={style} />;
  }

  return (
    <button
      onMouseDown={onKeyDown}
      onClick={() => onClick(suggestion)}
      style={style}
      role="option"
      type="button"
    >
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
