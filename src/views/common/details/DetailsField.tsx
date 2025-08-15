import React, { PropsWithChildren, ReactNode } from 'react';

const DetailsField: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div style={{ minWidth: '200px' }}>
      <span style={{ fontWeight: 600, marginRight: 4 }}>{title}</span>
      {children}
    </div>
  );
};

export default DetailsField;
