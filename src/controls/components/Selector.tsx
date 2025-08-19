import React, { ReactNode, useState } from 'react';

import { getPositionInGroup } from '../../generic/PositionInGroup';
import { useClickOutside } from '../../generic/useClickOutside';

import { SelectorDisplay } from './SelectorDisplay';
import { SelectorDropdown } from './SelectorDropdown';
import SelectorLabel from './SelectorLabel';
import SelectorOption from './SelectorOption';

type Props<T extends React.Key> = {
  display?: SelectorDisplay;
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode;
  onChange: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
  selectorDescription?: ReactNode;
  selectorLabel?: ReactNode;
  selectorStyle?: React.CSSProperties;
};

function Selector<T extends React.Key>({
  display = SelectorDisplay.ButtonList,
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
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
      <OptionsContainer isExpanded={expanded} containerRef={optionsRef} display={display}>
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
        <SelectorOption<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          labelSuffix={expanded ? ' ▼' : ' ▶'}
          onClick={() => setExpanded((prev) => !prev)}
          option={selected}
          display={display}
          isSelected={true}
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
    marginLeft: '0.125em',
    marginRight: '0.5em',
    marginBottom: '0.5em',
  };
  if (display === SelectorDisplay.ButtonList) {
    style.flexDirection = 'column';
    style.alignItems = 'start';
  } else if (display === SelectorDisplay.InlineDropdown) {
    style.marginLeft = '0';
    style.marginRight = '0';
    style.marginBottom = '0';
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
  isExpanded?: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  display?: SelectorDisplay;
};

const OptionsContainer: React.FC<React.PropsWithChildren<OptionsContainerProps>> = ({
  children,
  containerRef,
  isExpanded,
  display,
}) => {
  switch (display) {
    case SelectorDisplay.ButtonList:
      return (
        <div
          ref={containerRef}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25em 0.25em', marginLeft: '1em' }}
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
  getOptionDescription = () => undefined,
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

export default Selector;
