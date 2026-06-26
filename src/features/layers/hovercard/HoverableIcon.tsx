import { LucideIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from './HoverableButton';

type Props = {
  Icon: LucideIcon;
  onClick: () => void;
  description: string;
};

/**
 * Provides an icon that is correctly centered in a button
 */
const HoverableIcon: React.FC<Props> = ({ Icon, onClick, description }) => {
  return (
    <HoverableButton
      onClick={onClick}
      hoverContent={description}
      style={{ padding: '0.5em' }}
      aria-label={description}
    >
      <Icon size="1.5em" style={{ display: 'block' }} />
    </HoverableButton>
  );
};

export default HoverableIcon;
