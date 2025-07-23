import React from 'react';

import HoverableButton from '../../generic/HoverableButton';

type Props<T extends React.Key> = {
  getOptionDescription?: (value: T) => React.ReactNode;
  getOptionLabel?: (value: T) => React.ReactNode;
  onClick: (value: T) => void;
  option: T;
  isSelected: boolean;
};

function SelectorOption<T extends React.Key>({
  getOptionDescription = () => undefined,
  getOptionLabel = (val) => val as string,
  onClick,
  option,
  isSelected,
}: Props<T>) {
  return (
    <HoverableButton
      className={isSelected ? 'selected' : 'notselected'}
      hoverContent={getOptionDescription(option)}
      onClick={() => onClick(option)}
    >
      {getOptionLabel(option)}
    </HoverableButton>
  );
}

export default SelectorOption;
