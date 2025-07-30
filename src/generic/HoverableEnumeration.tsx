import React from 'react';

import Deemphasized from './Deemphasized';
import Hoverable from './Hoverable';

const HoverableEnumeration: React.FC<{
  items?: string[];
  limit?: number;
}> = ({ items, limit = 20 }) => {
  if (items == null) return null;
  if (items.length === 0) return <Deemphasized>0</Deemphasized>;

  return (
    <Hoverable
      hoverContent={items.slice(0, limit).join(', ') + (items.length > limit ? '...' : '')}
    >
      {items.length}
    </Hoverable>
  );
};

export default HoverableEnumeration;
