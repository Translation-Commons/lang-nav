import React, { ReactNode, useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { useClickOutside } from '../../generic/useClickOutside';

import SelectorLabel from './SelectorLabel';

export enum OptionsDisplay {
  Dropdown = 'dropdown', // Formatting is still off for these
  ButtonGroup = 'buttonGroup', // Unsure if we want to keep this
  ButtonList = 'buttonList',
}

type Props<T extends React.Key> = {
  appearance?: 'rounded' | 'tabs';
  selectorLabel?: ReactNode;
  selectorDescription?: ReactNode;
  size?: 'regular' | 'compact';
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  optionsDisplay?: OptionsDisplay;
  onChange: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
};

function Selector<T extends React.Key>({
  selectorLabel,
  selectorDescription,
  size = 'regular',
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
  selected,
  optionsDisplay = OptionsDisplay.ButtonList,
  onChange,
  options,
}: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const optionsRef = useClickOutside(() => setExpanded(false));

  return (
    <div
      className={'selector ' + size + ' ' + optionsDisplay}
      style={{
        marginLeft: '0.125em',
        marginRight: '0.5em',
        display: 'flex',
        flexDirection: optionsDisplay === OptionsDisplay.ButtonList ? 'column' : 'row',
        alignItems: optionsDisplay === OptionsDisplay.ButtonList ? 'start' : 'end',
        gap: optionsDisplay === OptionsDisplay.ButtonGroup ? '-0.125em' : '0',
      }}
    >
      <SelectorLabel
        label={selectorLabel}
        description={selectorDescription}
        optionsDisplay={optionsDisplay}
      />

      {optionsDisplay === OptionsDisplay.Dropdown && (
        <SelectorOption<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={(opt) => `${getOptionLabel(opt)} ${expanded ? `▼` : `▶`}`}
          onClick={() => setExpanded((prev) => !prev)}
          option={Array.isArray(selected) ? selected[0] : selected}
          optionsDisplay={optionsDisplay}
          isSelected={true}
        />
      )}
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
    </div>
  );
}

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
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em 0.5em', marginLeft: '1em' }}
        >
          {children}
        </div>
      );
    case OptionsDisplay.ButtonGroup:
      return <div ref={containerRef}>{children}</div>;
    case OptionsDisplay.Dropdown:
      if (isExpanded) {
        return (
          <div style={{ position: 'relative' }} ref={containerRef}>
            <div
              className="dropdown"
              style={{
                border: '0.125em solid var(--color-button-primary)',
                alignItems: 'end',
                position: 'absolute',
                display: 'flex',
                right: '0px',
                flexDirection: 'column',
                width: 'fit-content',
                zIndex: 100,
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
  return options.map((option) => (
    <SelectorOption<T>
      key={option}
      getOptionDescription={getOptionDescription}
      getOptionLabel={getOptionLabel}
      onClick={onClick}
      option={option}
      optionsDisplay={optionsDisplay}
      isSelected={Array.isArray(selected) ? selected.includes(option) : selected === option}
    />
  ));
}

type OptionProps<T extends React.Key> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  onClick: (value: T) => void;
  option: T;
  optionsDisplay: OptionsDisplay;
  isSelected: boolean;
};

function SelectorOption<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val: T) => val as string,
  onClick,
  option,
  optionsDisplay,
  isSelected,
}: OptionProps<T>) {
  return (
    <HoverableButton
      className={'selectorOption ' + (isSelected ? 'selected' : 'notselected')}
      hoverContent={getOptionDescription(option)}
      onClick={() => onClick(option)}
      style={getOptionStyle(optionsDisplay, isSelected)}
    >
      {getOptionLabel(option)}
    </HoverableButton>
  );
}

function getOptionStyle(optionsDisplay: OptionsDisplay, isSelected: boolean): React.CSSProperties {
  let borderRadius = '0px';
  let border = '0.125em solid var(--color-button-primary)';
  switch (optionsDisplay) {
    case OptionsDisplay.ButtonGroup:
      borderRadius = '0.25em';
      break;
    case OptionsDisplay.ButtonList:
      borderRadius = '1em';
      if (!isSelected) border = '0.125em solid var(--color-button-secondary)';
      break;
    case OptionsDisplay.Dropdown:
      break;
  }

  return {
    border,
    borderRadius,
    cursor: 'pointer',
    lineHeight: '1em',
    padding: '0.5em',
    whiteSpace: 'nowrap',
  };
}

export default Selector;
