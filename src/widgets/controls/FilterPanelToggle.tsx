import { SlidersHorizontalIcon } from 'lucide-react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import useFilterPanel from './useFilterPanel';

const FilterPanelToggle: React.FC = () => {
  const { isOpen, setIsOpen } = useFilterPanel();
  const label = isOpen ? 'Close filters panel' : 'Open filters panel';

  return (
    <HoverableButton
      className={isOpen ? 'selected primary' : 'primary'}
      hoverContent={label}
      onClick={() => setIsOpen((open) => !open)}
      style={{ padding: '0.5em', display: 'flex' }}
      aria-label={label}
    >
      <SlidersHorizontalIcon size="1.2em" />
    </HoverableButton>
  );
};

export default FilterPanelToggle;
