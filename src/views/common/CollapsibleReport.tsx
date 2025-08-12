import React, { ReactNode } from 'react';

const CollapsibleReport: React.FC<{
  children: React.ReactNode;
  title: ReactNode;
}> = ({ title, children }) => {
  return (
    <details className="collapsible-report">
      <summary
        style={{
          width: '100%',
          backgroundColor: 'var(--color-button-secondary)',
          padding: '0.5em',
          borderRadius: '0.5em',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: '1.2em',
          marginBottom: '1em',
        }}
      >
        {title}
      </summary>
      {children}
    </details>
  );
};

export default CollapsibleReport;
