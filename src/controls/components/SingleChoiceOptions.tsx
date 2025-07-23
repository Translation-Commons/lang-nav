import React, { useState } from 'react';

import HoverableButton from '../../generic/HoverableButton';
import { useClickOutside } from '../../generic/useClickOutside';

type Props<T extends React.Key> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode; // optional label renderer
  mode?: 'dropdown' | 'flat';
  onChange: (value: T) => void;
  options: readonly T[];
  selected: T;
};

function SingleChoiceOptions<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
  mode = 'dropdown',
  onChange,
  options,
  selected,
}: Props<T>) {
  const [expanded, setExpanded] = useState(false);
  const popupRef = useClickOutside(() => setExpanded(false));
  const contents = options.map((option) => (
    <HoverableButton
      key={option}
      className={selected === option ? 'selected' : 'notselected'}
      hoverContent={getOptionDescription(option)}
      onClick={() => {
        setExpanded(false);
        onChange(option);
      }}
    >
      {getOptionLabel(option)}
    </HoverableButton>
  ));

  if (mode === 'flat') {
    return <div className="flatOptions">{contents}</div>;
  }

  return (
    <>
      <HoverableButton
        hoverContent={getOptionDescription(selected)}
        className="selected LastChild"
        onClick={() => setExpanded((prev) => !prev)}
      >
        {getOptionLabel(selected)} {expanded ? `▼` : `▶`}
      </HoverableButton>
      {expanded && (
        <div className="SelectorPopupAnchor" ref={popupRef}>
          <div className="SelectorPopup">{contents}</div>
        </div>
      )}
    </>
  );
}

export default SingleChoiceOptions;
