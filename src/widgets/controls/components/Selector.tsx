import React, { ReactNode, useState } from 'react';

import { useClickOutside } from '@shared/hooks/useClickOutside';
import { getPositionInGroup } from '@shared/lib/PositionInGroup';

import { SelectorDisplay } from './SelectorDisplay';
import { SelectorDropdown } from './SelectorDropdown';
import SelectorLabel from './SelectorLabel';
import SelectorOption from './SelectorOption';

type Props<T extends React.Key> = {
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
  display = SelectorDisplay.ButtonList,
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
    <SelectorContainer display={display} manualStyle={selectorStyle}>
      {selectorLabel && (
        <SelectorLabel label={selectorLabel} description={selectorDescription} display={display} />
      )}

      {/* The dropdown menu or the button list */}
      <OptionsContainer
        isExpanded={expanded}
        containerRef={optionsRef}
        display={display}
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
          display={display}
          selected={selected}
        />
      </OptionsContainer>

      {/* Standalone option to open/close the dropdown menu */}
      {(display === SelectorDisplay.Dropdown || display === SelectorDisplay.InlineDropdown) && (
        <DropdownButton<T>
          display={display}
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          isExpanded={expanded}
          labelWhenEmpty={labelWhenEmpty}
          selected={selected}
          toggleDropdown={() => setExpanded((prev) => !prev)}
        />
      )}
    </SelectorContainer>
  );
}

const SelectorContainer: React.FC<
  React.PropsWithChildren<{
    manualStyle?: React.CSSProperties;
    display?: SelectorDisplay;
  }>
> = ({ children, display, manualStyle }) => {
  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  };
  if (display === SelectorDisplay.ButtonList) {
    style.flexDirection = 'column';
    style.alignItems = 'start';
  } else if (display === SelectorDisplay.ButtonGroup) {
    style.gap = '-0.125em'; // Overlap the buttons slightly
  }

  return (
    <div className={'selector ' + display} style={{ ...style, ...manualStyle }}>
      {children}
    </div>
  );
};

type OptionsContainerProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  display?: SelectorDisplay;
  hasSelectorLabel: boolean;
  isExpanded?: boolean;
};

const OptionsContainer: React.FC<React.PropsWithChildren<OptionsContainerProps>> = ({
  children,
  containerRef,
  display,
  hasSelectorLabel,
  isExpanded,
}) => {
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

type OptionsProps<T extends React.Key> = {
  display: SelectorDisplay;
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  onClick: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
};

function Options<T extends React.Key>({
  display,
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
      display={display}
      isSelected={Array.isArray(selected) ? selected.includes(option) : selected === option}
      position={getPositionInGroup(i, options.length)}
    />
  ));
}

type DropdownButtonProps<T extends React.Key> = {
  display: SelectorDisplay;
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode;
  isExpanded: boolean;
  labelWhenEmpty?: string;
  selected: T | T[];
  toggleDropdown: () => void;
};

function DropdownButton<T extends React.Key>({
  display,
  getOptionDescription,
  getOptionLabel,
  isExpanded,
  labelWhenEmpty,
  selected,
  toggleDropdown,
}: DropdownButtonProps<T>) {
  return (
    <SelectorOption<T>
      display={display}
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
