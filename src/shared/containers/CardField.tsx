import { LucideIcon } from 'lucide-react';
import React, { PropsWithChildren } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

type Props = PropsWithChildren<{
  title: string;
  icon: LucideIcon;
  description: string;
}>;

const CardField: React.FC<Props> = ({ children, title, icon: Icon, description }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em', gap: '0.5em' }}>
      <span aria-label={description} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
        <Hoverable
          hoverContent={
            <>
              <strong>{title}</strong>: {description}
            </>
          }
        >
          <Icon size="1em" style={{ display: 'block' }} />
        </Hoverable>
      </span>
      {children}
    </div>
  );
};

export default CardField;
