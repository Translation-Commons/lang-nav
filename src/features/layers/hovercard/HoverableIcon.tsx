import { LucideIcon } from 'lucide-react';
import React from 'react';

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
      className={className}
      onClick={onClick}
      hoverContent={description}
      style={{ padding: '0.5em' }}
    >
      <Icon size="1.5em" style={{ display: 'block' }} />
    </HoverableButton>
  );
};

export default HoverableIcon;
