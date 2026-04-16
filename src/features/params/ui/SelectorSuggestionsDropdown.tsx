import React from 'react';

import HoverableInternalLinkButton from '@features/layers/hovercard/HoverableInternalLinkButton';

import { getPositionInGroup, PositionInGroup } from '@shared/lib/PositionInGroup';

import { PageParamKey } from '../PageParamTypes';

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
    if (topLabel) {
      if (pos === PositionInGroup.Only) return PositionInGroup.Last;
      if (pos === PositionInGroup.Last) return PositionInGroup.Last;
      return PositionInGroup.Middle;
    }
    return pos;
  }

  return (
    <SelectorDropdown isOpen={showSuggestions && suggestions.length > 0}>
      {topLabel}
      {suggestions.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && suggestions[i - 1].group !== s.group && (
            <SelectorDropdownLabel position={PositionInGroup.Middle}>
              {s.group}
            </SelectorDropdownLabel>
          )}
          <SuggestionRow
            pageParameter={pageParameter}
            position={getPosition(i)}
            onClick={onClickSuggestion}
            onKeyDown={onKeyDownSuggestion}
            suggestion={s}
          />
        </React.Fragment>
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
  const style = getOptionStyle(
    SelectorDisplay.Dropdown,
    false, // isSelected is always false here
    position,
  );
  if (pageParameter === PageParamKey.searchString) {
    // Internal links to open the details page
    return <SuggestionRowOpenDetails suggestion={suggestion} style={style} />;
  }

  return (
    <a
      className="option"
      onMouseDown={onKeyDown}
      onClick={() => onClick(suggestion)}
      style={style}
      role="option"
    >
      {suggestion.label}
    </a>
  );
};

const SuggestionRowOpenDetails: React.FC<{
  suggestion: Suggestion;
  style?: React.CSSProperties;
}> = ({ style, suggestion }) => {
  const { objectID, searchString, label } = suggestion;

  return (
    <HoverableInternalLinkButton
      className="option"
      hoverContent={<>Open the details pane for {searchString}</>}
      keepOldParams={true}
      params={{ objectID, searchString }}
      style={style}
    >
      {label}
    </HoverableInternalLinkButton>
  );
};

export default SelectorSuggestionsDropdown;
