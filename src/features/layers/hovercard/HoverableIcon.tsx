import { LucideIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@shared/lib/utils';

import HoverableButton from './HoverableButton';

type Props = {
  className?: string;
  description: string;
  Icon: LucideIcon;
  onClick: () => void;
};

/**
 * Provides an icon that is correctly centered in a button
 */
const HoverableIcon: React.FC<Props> = ({ Icon, onClick, description, className }) => {
  return (
    <HoverableButton
      ariaLabel={description}
      className={cn('p-2', className)}
      onClick={onClick}
      hoverContent={description}
    >
      <Icon size="1.5em" className="block" />
    </HoverableButton>
  );
};

export default HoverableIcon;
