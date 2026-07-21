import React, { ReactNode } from 'react';

import CommaSeparated from '@shared/ui/old/CommaSeparated';
import Deemphasized from '@shared/ui/old/Deemphasized';

import Hoverable from './Hoverable';

type Props = {
  items?: ReactNode[];
  label?: ReactNode;
  limit?: number;
};

const HoverableEnumeration: React.FC<Props> = ({ items, label, limit = 20 }) => {
  if (items == null) return null;
  if (items.length === 0) return <Deemphasized>0</Deemphasized>;

  return (
    <Hoverable
      hoverContent={
        <div className="max-w-[300px]">
          <CommaSeparated limit={limit}>{items}</CommaSeparated>
        </div>
      }
    >
      {items.length}
      {label && <span className="ml-1">{label}</span>}
    </Hoverable>
  );
};

export default HoverableEnumeration;
