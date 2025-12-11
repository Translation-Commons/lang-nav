import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { getPositionInGroup, PositionInGroup } from '@shared/lib/PositionInGroup';

import { PageParamKey, View } from '../PageParamTypes';
import usePageParams from '../usePageParams';

import { SelectorDisplay } from './SelectorDisplayContext';
import { SelectorDropdown } from './SelectorDropdown';
import SelectorDropdownLabel from './SelectorDropdownLabel';
import { getOptionStyle } from './SelectorOption';
import { Suggestion } from './SelectorSuggestions';

type Props = {
  onClickSuggestion: (suggestion: Suggestion) => void;
  onKeyDownSuggestion: () => void;
  pageParameter?: PageParamKey;
  showSuggestions: boolean;
  suggestions: Suggestion[];
  topLabel?: React.ReactElement<typeof SelectorDropdownLabel>;
};

const SelectorSuggestionsDropdown: React.FC<Props> = ({
  onClickSuggestion,
  onKeyDownSuggestion,
  pageParameter,
  showSuggestions,
  suggestions,
  topLabel,
}) => {
  function getPosition(index: number) {
    const pos = getPositionInGroup(index, suggestions.length);
    if (topLabel && pos !== PositionInGroup.Last) return PositionInGroup.Middle;
    return pos;
  }

  return (
    <SelectorDropdown isOpen={showSuggestions && suggestions.length > 0}>
      {topLabel}
      {suggestions.map((s, i) => (
        <SuggestionRow
          key={i}
          pageParameter={pageParameter}
          position={getPosition(i)}
          onClick={onClickSuggestion}
          onKeyDown={onKeyDownSuggestion}
          suggestion={s}
        />
      ))}
    </SelectorDropdown>
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
  if (view === View.Details && pageParameter === PageParamKey.searchString) {
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

export default SelectorSuggestionsDropdown;
