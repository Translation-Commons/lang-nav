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
  optionStyle?: React.CSSProperties;
  options: readonly T[];
  selected: T | T[];
  selectorDescription?: ReactNode;
  selectorLabel?: ReactNode;
  selectorStyle?: React.CSSProperties;
};

const FILTER_LIST_INITIAL_COUNT = 5;

function Selector<T extends React.Key>({
  display,
  getOptionDescription,
  getOptionLabel = (val) => val as string,
  labelWhenEmpty,
  onChange,
  optionStyle,
  options,
  selected,
  selectorDescription,
  selectorLabel,
  selectorStyle,
}: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const optionsRef = useClickOutside(() => {
    // Only auto-collapse for dropdown modes; FilterList is a persistent filter UI
    if (display !== SelectorDisplay.FilterList) {
      setTimeout(() => setExpanded(false), 100);
    }
  });

  // For FilterList: collapse to first N items unless expanded
  const isFilterList = display === SelectorDisplay.FilterList;
  const filterListCollapsed =
    isFilterList && !expanded && options.length > FILTER_LIST_INITIAL_COUNT;
  const visibleOptions = filterListCollapsed
    ? options.slice(0, FILTER_LIST_INITIAL_COUNT)
    : options;

  return (
    <SelectorContainer manualStyle={selectorStyle} manualDisplay={display}>
      {selectorLabel && <SelectorLabel label={selectorLabel} description={selectorDescription} />}

      <div className="selectorButtons">
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
              if (!isFilterList) setExpanded(false);
              onChange(option);
            }}
            optionStyle={optionStyle}
            options={visibleOptions}
            selected={selected}
          />
        </OptionsContainer>

        {/* "More / Less" toggle for FilterList when there are enough options */}
        <FilterListMoreButton
          totalCount={options.length}
          isExpanded={expanded}
          toggle={() => setExpanded((prev) => !prev)}
        />

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

  // Prepare the container. If there was a manual display, then wrap in a provider.
  const container = (
    <div className={'selector ' + display} style={{ ...manualStyle }}>
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
  isExpanded: boolean;
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
          className="selectorOptions"
          ref={containerRef}
          style={{ marginLeft: hasSelectorLabel ? '1em' : 'none' }}
        >
          {children}
        </div>
      );
    case SelectorDisplay.FilterList:
      return (
        <div
          className="selectorOptions"
          ref={containerRef}
          style={{ marginLeft: hasSelectorLabel ? '1em' : 'none' }}
        >
          {children}
        </div>
      );
    case SelectorDisplay.ButtonGroup:
      return <>{children}</>;
    case SelectorDisplay.Dropdown:
    case SelectorDisplay.InlineDropdown:
      return (
        <SelectorDropdown isOpen={isExpanded || false} containerRef={containerRef}>
          {children}
        </SelectorDropdown>
      );
  }
};

type OptionsProps<T> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  onClick: (value: T) => void;
  optionStyle?: React.CSSProperties;
  options: readonly T[];
  selected: T | T[];
};

function Options<T extends React.Key>({
  getOptionDescription,
  getOptionLabel,
  onClick,
  optionStyle,
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
      optionStyle={optionStyle}
      isSelected={Array.isArray(selected) ? selected.includes(option) : selected === option}
      position={getPositionInGroup(i, options.length)}
    />
  ));
}

type FilterListMoreButtonProps = {
  totalCount: number;
  isExpanded: boolean;
  toggle: () => void;
};

const FilterListMoreButton: React.FC<FilterListMoreButtonProps> = ({
  totalCount,
  isExpanded,
  toggle,
}) => {
  const { display } = useSelectorDisplay();
  if (display !== SelectorDisplay.FilterList || totalCount <= FILTER_LIST_INITIAL_COUNT)
    return null;

  return (
    <button className="filterListMoreButton" onClick={toggle}>
      {isExpanded ? 'Collapse' : 'Expand All'}
    </button>
  );
};

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
