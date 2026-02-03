import { LucideIcon } from 'lucide-react';
import React, { PropsWithChildren, ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

type Props = PropsWithChildren<{
  title: ReactNode;
  icon: LucideIcon;
  description: string;
}>;

const CardField: React.FC<Props> = ({ children, title, icon: Icon, description }) => {
  return (
    <div>
      <h4 style={{ display: 'flex', gap: '0.5em' }}>
        <span
          aria-label={description}
          title={description}
          style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
        >
          <Hoverable hoverContent={description}>
            <Icon size="1em" style={{ display: 'block' }} />
          </Hoverable>
        </span>
        {title}
      </h4>
      {children}
    </div>
  );
};

export default CardField;
