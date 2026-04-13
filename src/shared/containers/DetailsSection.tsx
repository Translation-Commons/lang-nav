import React, { PropsWithChildren, ReactNode } from 'react';

const DetailsSection: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div
      style={{
        marginBottom: '1em',
        border: '1px solid var(--color-button-secondary)',
        borderRadius: '0.5em',
        padding: '1em',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3 style={{ marginBottom: '0.25em', textTransform: 'uppercase' }}>{title}</h3>
      {children}
    </div>
  );
};

export default DetailsSection;
