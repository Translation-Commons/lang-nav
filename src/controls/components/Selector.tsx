import React, { ReactNode, useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { getPositionInGroup, PositionInGroup } from '../../generic/PositionInGroup';
import { useClickOutside } from '../../generic/useClickOutside';

import SelectorLabel from './SelectorLabel';

export enum OptionsDisplay {
  Dropdown = 'dropdown', // Formatting is still off for these
  InlineDropdown = 'inlineDropdown', // Used to be inline with text
  ButtonGroup = 'buttonGroup', // Unsure if we want to keep this
  ButtonList = 'buttonList',
}

type Props<T extends React.Key> = {
  appearance?: 'rounded' | 'tabs';
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  onChange: (value: T) => void;
  options: readonly T[];
  optionsDisplay?: OptionsDisplay;
  selected: T | T[];
  selectorDescription?: ReactNode;
  selectorLabel?: ReactNode;
};

function Selector<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
  onChange,
  options,
  optionsDisplay = OptionsDisplay.ButtonList,
  selected,
  selectorDescription,
  selectorLabel,
}: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const optionsRef = useClickOutside(() => setExpanded(false));
  // const optionsRef = useClickOutside(() => setExpanded(true));

  return (
    <SelectorContainer optionsDisplay={optionsDisplay}>
      {selectorLabel && (
        <SelectorLabel
          label={selectorLabel}
          description={selectorDescription}
          optionsDisplay={optionsDisplay}
        />
      )}

      {/* The dropdown menu or the button list */}
      <OptionsContainer
        isExpanded={expanded}
        containerRef={optionsRef}
        optionsDisplay={optionsDisplay}
      >
        <Options<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          onClick={(option) => {
            setExpanded(false);
            onChange(option);
          }}
          options={options}
          optionsDisplay={optionsDisplay}
          selected={selected}
        />
      </OptionsContainer>

      {/* Standalone option to open/close the dropdown menu */}
      {(optionsDisplay === OptionsDisplay.Dropdown ||
        optionsDisplay === OptionsDisplay.InlineDropdown) && (
        <SelectorOption<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={(opt) => `${getOptionLabel(opt)} ${expanded ? `▼` : `▶`}`}
          onClick={() => setExpanded((prev) => !prev)}
          option={Array.isArray(selected) ? selected[0] : selected}
          optionsDisplay={optionsDisplay}
          isSelected={true}
        />
      )}
    </SelectorContainer>
  );
}

const SelectorContainer: React.FC<
  React.PropsWithChildren<{
    optionsDisplay?: OptionsDisplay;
  }>
> = ({ children, optionsDisplay }) => {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'end',
    marginLeft: '0.125em',
    marginRight: '0.5em',
    marginBottom: '0.5em',
  };
  if (optionsDisplay === OptionsDisplay.ButtonList) {
    style.flexDirection = 'column';
    style.alignItems = 'start';
  } else if (optionsDisplay === OptionsDisplay.InlineDropdown) {
    style.marginLeft = '0';
    style.marginRight = '0';
    style.marginBottom = '0';
  } else if (optionsDisplay === OptionsDisplay.ButtonGroup) {
    style.gap = '-0.125em'; // Overlap the buttons slightly
  }

  return (
    <div className={'selector ' + optionsDisplay} style={style}>
      {children}
    </div>
  );
};

type OptionsContainerProps = {
  isExpanded?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  optionsDisplay?: OptionsDisplay;
};

const OptionsContainer: React.FC<React.PropsWithChildren<OptionsContainerProps>> = ({
  children,
  containerRef,
  isExpanded,
  optionsDisplay,
}) => {
  switch (optionsDisplay) {
    case OptionsDisplay.ButtonList:
      return (
        <div
          ref={containerRef}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em 0.25em', marginLeft: '1em' }}
        >
          {children}
        </div>
      );
    case OptionsDisplay.ButtonGroup:
      return <>{children}</>;
    case OptionsDisplay.Dropdown:
    case OptionsDisplay.InlineDropdown:
      if (isExpanded) {
        return (
          <div style={{ position: 'relative' }} ref={containerRef}>
            <div
              className="dropdown"
              style={{
                alignItems: 'start',
                position: 'absolute',
                display: 'flex',
                left: '0px',
                flexDirection: 'column',
                width: 'fit-content',
                zIndex: 100,
                marginTop: optionsDisplay === OptionsDisplay.InlineDropdown ? '0.25em' : '0',
              }}
            >
              {children}
            </div>
          </div>
        );
      }
      return null;
  }
};

type OptionsProps<T extends React.Key> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  onClick: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
  optionsDisplay: OptionsDisplay;
};

function Options<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
  onClick,
  options,
  optionsDisplay,
  selected,
}: OptionsProps<T>) {
  return options.map((option, i) => (
    <SelectorOption<T>
      key={option}
      getOptionDescription={getOptionDescription}
      getOptionLabel={getOptionLabel}
      onClick={onClick}
      option={option}
      optionsDisplay={optionsDisplay}
      isSelected={Array.isArray(selected) ? selected.includes(option) : selected === option}
      position={getPositionInGroup(i, options.length)}
    />
  ));
}

type OptionProps<T extends React.Key> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  isSelected: boolean;
  onClick: (value: T) => void;
  option: T;
  optionsDisplay: OptionsDisplay;
  position?: PositionInGroup; // used for styling
};

function SelectorOption<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val: T) => val as string,
  isSelected,
  onClick,
  option,
  optionsDisplay,
  position = PositionInGroup.Standalone,
}: OptionProps<T>) {
  return (
    <HoverableButton
      className={'selectorOption ' + (isSelected ? 'selected' : 'notselected')}
      hoverContent={getOptionDescription(option)}
      onClick={() => onClick(option)}
      style={getOptionStyle(optionsDisplay, isSelected, position)}
    >
      {getOptionLabel(option)}
    </HoverableButton>
  );
}

export function getOptionStyle(
  optionsDisplay: OptionsDisplay,
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
  switch (optionsDisplay) {
    case OptionsDisplay.ButtonGroup:
      if (position === PositionInGroup.Last) {
        style.marginLeft = '-0.125em';
        style.borderRadius = '0 1em 1em 0';
      } else if (position === PositionInGroup.First) {
        style.borderRadius = '1em 0 0 1em';
      } else if (position === PositionInGroup.Middle) {
        style.marginLeft = '-0.125em';
      }
      break;
    case OptionsDisplay.ButtonList:
      style.borderRadius = '1em';
      if (!isSelected) style.border = '0.125em solid var(--color-button-secondary)';
      break;
    case OptionsDisplay.InlineDropdown:
      // The standalone option should match the regular page text
      if (position === PositionInGroup.Standalone) {
        style.backgroundColor = 'transparent';
        style.color = 'var(--color-text)';
        style.border = 'none';
        style.padding = '0';
        return style;
      }
      // otherwise return the Dropdown style
      return getOptionStyle(OptionsDisplay.Dropdown, isSelected, position);
    case OptionsDisplay.Dropdown:
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

export default Selector;
