import { SlidersHorizontalIcon } from 'lucide-react';

import { Button } from '@shared/ui/button';

import useFilterPanel from './useFilterPanel';

const FilterPanelToggle: React.FC = () => {
  const { isOpen, setIsOpen } = useFilterPanel();
  const label = isOpen ? 'Close filters panel' : 'Open filters panel';

  return (
    <Button
      variant={isOpen ? 'secondary' : 'outline'}
      size="icon"
      aria-label={label}
      aria-expanded={isOpen}
      title={label}
      onClick={() => setIsOpen((open) => !open)}
    >
      <SlidersHorizontalIcon />
    </Button>
  );
};

export default FilterPanelToggle;
