import React, { PropsWithChildren, ReactNode } from 'react';

import ContextIcon from '@shared/ui/ContextIcon';

type Props = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  endContent?: ReactNode;
  indent?: number;
}>;

const DetailsField: React.FC<Props> = ({
  children,
  title,
  description,
  endContent,
  indent = 0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: indent * 2 + 'em',
      }}
    >
      <div style={{ minWidth: '200px' }}>
        <div style={{ fontWeight: 600, marginRight: '0.25em', display: 'inline-flex' }}>
          {title}
          {description && <ContextIcon>{description}</ContextIcon>}
          <span style={{ fontWeight: 'normal' }}>:</span>
        </div>
        {children}
      </div>
      {endContent}
    </div>
  );
};

export default DetailsField;
