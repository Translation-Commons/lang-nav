import React, { useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { useClickOutside } from '../../generic/useClickOutside';

type Props<T extends React.Key> = {
  getOptionDescription?: (value: T | T[]) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  mode?: 'flat' | 'dropdown';
  onToggleOption: (value: T) => void;
  options: readonly T[];
  selected: T[];
};

function MultiChoiceOptions<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
  mode,
  onToggleOption,
  options,
  selected,
}: Props<T>) {
  const contents = options.map((option) => (
    <HoverableButton
      key={option}
      className={selected.includes(option) ? 'selected' : 'notselected'}
      hoverContent={getOptionDescription(option)}
      onClick={() => onToggleOption(option)}
    >
      {getOptionLabel(option)}
    </HoverableButton>
  ));
  const [expanded, setExpanded] = useState(false);
  const popupRef = useClickOutside(() => setExpanded(false));

  return mode == 'flat' ? (
    contents
  ) : (
    <>
      <HoverableButton
        hoverContent={getOptionDescription(selected)}
        className={`${selected.length > 0 ? 'selected' : 'notselected'} LastChild`}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {selected.length === 0 && 'None selected'}
        {selected.length === 1 && getOptionLabel(selected[0])}
        {selected.length > 1 && 'Multiple selected'} {expanded ? `▼` : `▶`}
      </HoverableButton>
      {expanded && (
        <div style={{ position: 'relative' }} ref={popupRef}>
          <div className="SelectorPopup">{contents}</div>
        </div>
      )}
    </>
  );
}

export default MultiChoiceOptions;
