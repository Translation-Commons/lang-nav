import React, { ReactNode, useState } from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@shared/ui/hover-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@shared/ui/toggle-group';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
  useSelectorDisplay,
} from './SelectorDisplayContext';
import SelectorLabel from './SelectorLabel';

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

const FILTER_LIST_INITIAL_COUNT = 4;

function Selector<T extends React.Key>(props: Props<T>) {
  const { display: inheritedDisplay } = useSelectorDisplay();
  const display = props.display ?? inheritedDisplay;
  const content = <SelectorBody {...props} display={display} />;
  // Wrap in a provider when a display is explicitly requested so descendants
  // (eg. SelectorLabel) observe the same display mode as the legacy component did.
  if (props.display != null) {
    return <SelectorDisplayProvider display={props.display}>{content}</SelectorDisplayProvider>;
  }
  return content;
}

function SelectorBody<T extends React.Key>({
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
}: Props<T> & { display: SelectorDisplay }) {
  const isFilterList = display === SelectorDisplay.FilterList;
  const isDropdown =
    display === SelectorDisplay.Dropdown || display === SelectorDisplay.InlineDropdown;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1',
        isFilterList && 'flex-col items-start gap-0.5',
      )}
      style={selectorStyle}
    >
      {selectorLabel && <SelectorLabel label={selectorLabel} description={selectorDescription} />}

      {isDropdown && (
        <SelectMode<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          inline={display === SelectorDisplay.InlineDropdown}
          labelWhenEmpty={labelWhenEmpty}
          onChange={onChange}
          options={options}
          selected={selected}
        />
      )}

      {(display === SelectorDisplay.ButtonGroup || display === SelectorDisplay.ButtonList) && (
        <ToggleMode<T>
          connected={display === SelectorDisplay.ButtonGroup}
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          onChange={onChange}
          optionStyle={optionStyle}
          options={options}
          selected={selected}
        />
      )}

      {isFilterList && (
        <FilterListMode<T>
          getOptionDescription={getOptionDescription}
          getOptionLabel={getOptionLabel}
          onChange={onChange}
          options={options}
          selected={selected}
        />
      )}
    </div>
  );
}

/** Renders the label for an option, wrapping it in a hover card when a description is available. */
function OptionContent<T>({
  option,
  getOptionLabel,
  getOptionDescription,
}: {
  option: T;
  getOptionLabel: (value: T) => React.ReactNode;
  getOptionDescription?: (value: T) => React.ReactNode;
}) {
  const label = getOptionLabel(option);
  const description = getOptionDescription?.(option);
  if (description == null) return <>{label}</>;
  return (
    <HoverCard>
      <HoverCardTrigger render={<span className="inline-flex items-center gap-1" />}>
        {label}
      </HoverCardTrigger>
      <HoverCardContent className="w-80">{description}</HoverCardContent>
    </HoverCard>
  );
}

type ModeProps<T> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel: (value: T) => React.ReactNode;
  onChange: (value: T) => void;
  options: readonly T[];
  selected: T | T[];
};

function SelectMode<T extends React.Key>({
  getOptionDescription,
  getOptionLabel,
  inline,
  labelWhenEmpty,
  onChange,
  options,
  selected,
}: ModeProps<T> & { inline?: boolean; labelWhenEmpty?: string }) {
  const triggerClassName = inline
    ? 'h-auto gap-0.5 border-0 bg-transparent px-1 py-0 font-inherit dark:bg-transparent dark:hover:bg-transparent'
    : undefined;

  const renderItems = () =>
    options.map((option) => (
      <SelectItem key={option} value={option}>
        <OptionContent
          option={option}
          getOptionLabel={getOptionLabel}
          getOptionDescription={getOptionDescription}
        />
      </SelectItem>
    ));

  if (Array.isArray(selected)) {
    return (
      <Select
        multiple
        value={selected}
        onValueChange={(next: T[]) => {
          const toggled = toggledValue(selected, next);
          if (toggled != null) onChange(toggled);
        }}
      >
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={labelWhenEmpty ?? 'None'}>
            {(values: T[] | null) =>
              values && values.length > 0 ? (
                joinLabels(values, getOptionLabel)
              ) : (
                <span className="text-muted-foreground">{labelWhenEmpty ?? 'None'}</span>
              )
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>{renderItems()}</SelectContent>
      </Select>
    );
  }

  return (
    <Select
      value={selected}
      onValueChange={(next: T | null) => {
        if (next != null) onChange(next);
      }}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={labelWhenEmpty}>
          {(value: T | null) => (value != null ? getOptionLabel(value) : (labelWhenEmpty ?? ''))}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>{renderItems()}</SelectContent>
    </Select>
  );
}

function ToggleMode<T extends React.Key>({
  connected,
  getOptionDescription,
  getOptionLabel,
  onChange,
  optionStyle,
  options,
  selected,
}: ModeProps<T> & { connected?: boolean; optionStyle?: React.CSSProperties }) {
  const isMulti = Array.isArray(selected);
  const selectedValues = (isMulti ? selected : [selected]).map(String);

  return (
    <ToggleGroup
      multiple={isMulti}
      spacing={connected ? 0 : 2}
      value={selectedValues}
      variant="outline"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={String(option)}
          variant="outline"
          className="aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          onClick={() => onChange(option)}
          style={optionStyle}
        >
          <OptionContent
            option={option}
            getOptionLabel={getOptionLabel}
            getOptionDescription={getOptionDescription}
          />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function FilterListMode<T extends React.Key>({
  getOptionDescription,
  getOptionLabel,
  onChange,
  options,
  selected,
}: ModeProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const selectedValues = Array.isArray(selected) ? selected : [selected];
  const canCollapse = options.length > FILTER_LIST_INITIAL_COUNT + 1;
  const visibleOptions =
    canCollapse && !expanded ? options.slice(0, FILTER_LIST_INITIAL_COUNT) : options;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleOptions.map((option) => {
        const isSelected = selectedValues.includes(option);
        return (
          <Button
            key={option}
            type="button"
            size="xs"
            variant={isSelected ? 'secondary' : 'ghost'}
            aria-pressed={isSelected}
            className={cn(isSelected && 'border-primary')}
            onClick={() => onChange(option)}
          >
            <OptionContent
              option={option}
              getOptionLabel={getOptionLabel}
              getOptionDescription={getOptionDescription}
            />
          </Button>
        );
      })}
      {canCollapse && (
        <Button type="button" variant="link" size="xs" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Collapse' : 'Expand All'}
        </Button>
      )}
    </div>
  );
}

/** Symmetric difference of two arrays: the single value that was toggled on or off. */
function toggledValue<T>(prev: readonly T[], next: readonly T[]): T | undefined {
  const added = next.find((value) => !prev.includes(value));
  if (added != null) return added;
  return prev.find((value) => !next.includes(value));
}

function joinLabels<T>(values: readonly T[], getOptionLabel: (value: T) => React.ReactNode) {
  return values.map((value, i) => (
    <React.Fragment key={String(value)}>
      {i > 0 && ' or '}
      {getOptionLabel(value)}
    </React.Fragment>
  ));
}

export default Selector;
