import React, { PropsWithChildren, ReactNode } from 'react';

const DetailsSection: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div style={{ marginBottom: '1em' }}>
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default DetailsSection;
