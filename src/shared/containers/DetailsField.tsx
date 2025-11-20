import React, { PropsWithChildren, ReactNode } from 'react';

const DetailsField: React.FC<PropsWithChildren<{ title: ReactNode; endContent?: ReactNode }>> = ({
  children,
  title,
  endContent,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ minWidth: '200px' }}>
        <span style={{ fontWeight: 600, marginRight: 4 }}>{title}</span>
        {children}
      </div>
      {endContent}
    </div>
  );
};

export default DetailsField;
