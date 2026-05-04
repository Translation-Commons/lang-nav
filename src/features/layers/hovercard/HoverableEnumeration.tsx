import React, { ReactNode } from 'react';

import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

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
        <div style={{ maxWidth: '300px' }}>
          <CommaSeparated limit={limit}>{items}</CommaSeparated>
        </div>
      }
    >
      {items.length}
      {label && <span style={{ marginLeft: '0.25em' }}>{label}</span>}
    </Hoverable>
  );
};

export default HoverableEnumeration;
