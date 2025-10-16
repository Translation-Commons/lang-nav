import { PositionInGroup } from '@shared/lib/PositionInGroup';
import HoverableButton from '@shared/ui/HoverableButton';
import React, { ReactNode } from 'react';

import { SelectorDisplay } from './SelectorDisplay';

type OptionProps<T extends React.Key> = {
  display: SelectorDisplay;
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  isSelected: boolean;
  labelSuffix?: ReactNode; // Appeals after the label
  onClick: (value: T) => void;
  option: T | T[];
  position?: PositionInGroup; // used for styling
};

function SelectorOption<T extends React.Key>({
  display,
  getOptionDescription,
  getOptionLabel = (val) => val as string,
  isSelected,
  labelSuffix,
  onClick,
  option,
  position = PositionInGroup.Standalone,
}: OptionProps<T>) {
  let className = 'selectorOption';
  if (isSelected) className += ' selected';
  if (!isSelected) className += ' unselected';
  if (display === SelectorDisplay.InlineDropdown && position === PositionInGroup.Standalone)
    className += ' hoverableText';
  return (
    <HoverableButton
      className={className}
      hoverContent={
        getOptionDescription
          ? Array.isArray(option)
            ? option.map(getOptionDescription).join('\n')
            : getOptionDescription(option)
          : null
      }
      onClick={() => onClick(Array.isArray(option) ? option[0] : option)}
      style={getOptionStyle(display, isSelected, position)}
    >
      {Array.isArray(option) ? option.map(getOptionLabel).join(' or ') : getOptionLabel(option)}
      {labelSuffix}
    </HoverableButton>
  );
}

export function getOptionStyle(
  display: SelectorDisplay,
  isSelected: boolean,
  position: PositionInGroup,
): React.CSSProperties {
  // Standard option style
  const style: React.CSSProperties = {
    border: '0.125em solid var(--color-button-primary)',
    borderRadius: '0px',
    cursor: 'pointer',
    lineHeight: '1em',
    padding: '0.5em',
    whiteSpace: 'nowrap',
  };
  // Customize based on position and display type
  switch (display) {
    case SelectorDisplay.ButtonGroup:
      if (position === PositionInGroup.Last) {
        style.marginLeft = '-0.125em';
        style.borderRadius = '0 1em 1em 0';
      } else if (position === PositionInGroup.First) {
        style.borderRadius = '1em 0 0 1em';
      } else if (position === PositionInGroup.Middle) {
        style.marginLeft = '-0.125em';
      }
      break;
    case SelectorDisplay.ButtonList:
      style.borderRadius = '1em';
      if (!isSelected) style.border = '0.125em solid var(--color-button-secondary)';
      break;
    case SelectorDisplay.InlineDropdown:
      // The standalone option should match the regular page text
      if (position === PositionInGroup.Standalone) {
        style.margin = '-0.25em';
        style.border = 'none';
        style.borderRadius = '.5em';
        style.padding = '0.25em';
        return style;
      }
      // otherwise return the Dropdown style
      return getOptionStyle(SelectorDisplay.Dropdown, isSelected, position);
    case SelectorDisplay.Dropdown:
      style.textAlign = 'left';
      style.width = '100%';
      style.borderRadius = undefined;
      if (position === PositionInGroup.First) {
        style.borderRadius = '1em 1em 0 0';
        style.margin = '0 0 -0.125em 0';
        style.borderBottom = 'none';
      } else if (position === PositionInGroup.Last) {
        style.borderRadius = '0 0 1em 1em';
        style.margin = '0';
        style.borderTop = 'none';
      } else if (position === PositionInGroup.Middle) {
        style.margin = '0 0 -0.125em 0';
        style.borderRadius = '0';
        style.borderTop = 'none';
        style.borderBottom = 'none';
      } else if (position === PositionInGroup.Only) {
        style.borderRadius = '1em';
      } else if (position === PositionInGroup.Standalone) {
        style.borderRadius = '1em';
        style.width = 'fit-content';
      }
      break;
  }

  return style;
}

export default SelectorOption;
