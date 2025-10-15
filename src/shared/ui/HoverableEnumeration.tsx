import Deemphasized from '@shared/ui/Deemphasized';
import Hoverable from '@shared/ui/Hoverable';
import React, { ReactNode } from 'react';

type Props = {
  items?: string[];
  label?: ReactNode;
  limit?: number;
};

const HoverableEnumeration: React.FC<Props> = ({ items, label, limit = 20 }) => {
  if (items == null) return null;
  if (items.length === 0) return <Deemphasized>0</Deemphasized>;

  return (
    <Hoverable
      hoverContent={items.slice(0, limit).join(', ') + (items.length > limit ? '...' : '')}
    >
      {items.length}
      {label && <span style={{ marginLeft: '0.25em' }}>{label}</span>}
    </Hoverable>
  );
};

export default HoverableEnumeration;
