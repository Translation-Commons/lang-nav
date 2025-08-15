import React, { PropsWithChildren, ReactNode } from 'react';

const DetailsSection: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div style={{ marginBottom: '1em' }}>
      <h3 style={{ marginBottom: '0.25em' }}>{title}</h3>
      {children}
    </div>
  );
};

export default DetailsSection;
