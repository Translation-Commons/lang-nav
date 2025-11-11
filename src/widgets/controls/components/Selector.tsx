import React, { ReactNode, useState } from 'react';

import { useClickOutside } from '@shared/hooks/useClickOutside';
import { getPositionInGroup } from '@shared/lib/PositionInGroup';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from './SelectorDisplayContext';
import { SelectorDropdown } from './SelectorDropdown';
import SelectorLabel from './SelectorLabel';
import SelectorOption from './SelectorOption';

type Props<T> = {
  display?: SelectorDisplay;
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode;
  labelWhenEmpty?: string; // for multi-select options
  onChange: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
  selectorDescription?: ReactNode;
  selectorLabel?: ReactNode;
  selectorStyle?: React.CSSProperties;
};

function Selector<T extends React.Key>({
  display,
  getOptionDescription,
  getOptionLabel = (val) => val as string,
  labelWhenEmpty,
  onChange,
  options,
  selected,
  selectorDescription,
  selectorLabel,
  selectorStyle,
}: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const optionsRef = useClickOutside(() => setExpanded(false));

  return (
    <SelectorContainer manualStyle={selectorStyle} manualDisplay={display}>
      {selectorLabel && <SelectorLabel label={selectorLabel} description={selectorDescription} />}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* The dropdown menu or the button list */}
        <OptionsContainer
          isExpanded={expanded}
          containerRef={optionsRef}
          hasSelectorLabel={!!selectorLabel}
        >
          <Options<T>
            getOptionDescription={getOptionDescription}
            getOptionLabel={getOptionLabel}
            onClick={(option) => {
              setExpanded(false);
              onChange(option);
            }}
            options={options}
            selected={selected}
          />
        </OptionsContainer>

        {/* Standalone option to open/close the dropdown menu */}
        <DropdownButton<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          isExpanded={expanded}
          labelWhenEmpty={labelWhenEmpty}
          selected={selected}
          toggleDropdown={() => setExpanded((prev) => !prev)}
        />
      </div>
    </SelectorContainer>
  );
}

const SelectorContainer: React.FC<
  React.PropsWithChildren<{
    manualStyle?: React.CSSProperties;
    manualDisplay?: SelectorDisplay;
  }>
> = ({ children, manualStyle, manualDisplay }) => {
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = manualDisplay ?? inheritedDisplay;

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  };
  if (display === SelectorDisplay.ButtonList) {
    style.flexDirection = 'column';
    style.alignItems = 'start';
  } else if (display === SelectorDisplay.ButtonGroup) {
    style.gap = '-0.125em'; // Overlap the buttons slightly
  }

  // Prepare the container. If there was a manual display, then wrap in a provider.
  const container = (
    <div className={'selector ' + display} style={{ ...style, ...manualStyle }}>
      {children}
    </div>
  );
  if (manualDisplay)
    return <SelectorDisplayProvider display={manualDisplay}>{container}</SelectorDisplayProvider>;
  return container;
};

type OptionsContainerProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  hasSelectorLabel: boolean;
  isExpanded?: boolean;
};

const OptionsContainer: React.FC<React.PropsWithChildren<OptionsContainerProps>> = ({
  children,
  containerRef,
  hasSelectorLabel,
  isExpanded,
}) => {
  const { display } = useSelectorDisplay();

  switch (display) {
    case SelectorDisplay.ButtonList:
      return (
        <div
          ref={containerRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.25em',
            marginLeft: hasSelectorLabel ? '1em' : 'none',
          }}
        >
          {children}
        </div>
      );
    case SelectorDisplay.ButtonGroup:
      return <>{children}</>;
    case SelectorDisplay.Dropdown:
    case SelectorDisplay.InlineDropdown:
      if (isExpanded) {
        return <SelectorDropdown containerRef={containerRef}>{children}</SelectorDropdown>;
      }
      return null;
  }
};

type OptionsProps<T> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  onClick: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
};

function Options<T extends React.Key>({
  getOptionDescription,
  getOptionLabel,
  onClick,
  options,
  selected,
}: OptionsProps<T>) {
  return options.map((option, i) => (
    <SelectorOption<T>
      key={option}
      getOptionDescription={getOptionDescription}
      getOptionLabel={getOptionLabel}
      onClick={onClick}
      option={option}
      isSelected={Array.isArray(selected) ? selected.includes(option) : selected === option}
      position={getPositionInGroup(i, options.length)}
    />
  ));
}

type DropdownButtonProps<T> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode;
  isExpanded: boolean;
  labelWhenEmpty?: string;
  selected: T | T[];
  toggleDropdown: () => void;
};

function DropdownButton<T extends React.Key>({
  getOptionDescription,
  getOptionLabel,
  isExpanded,
  labelWhenEmpty,
  selected,
  toggleDropdown,
}: DropdownButtonProps<T>) {
  const { display } = useSelectorDisplay();
  if (display !== SelectorDisplay.Dropdown && display !== SelectorDisplay.InlineDropdown)
    return null;

  return (
    <SelectorOption<T>
      getOptionDescription={getOptionDescription}
      getOptionLabel={getOptionLabel}
      isSelected={true}
      labelSuffix={isExpanded ? ' ▼' : ' ▶'}
      labelWhenEmpty={labelWhenEmpty}
      onClick={() => toggleDropdown()}
      option={selected}
    />
  );
}

export default Selector;
