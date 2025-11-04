import React, { PropsWithChildren } from 'react';

const Pill: React.FC<PropsWithChildren<{ style?: React.CSSProperties }>> = ({
  children,
  style,
}) => {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: '0.25em 0.5em',
        borderRadius: '.5em',
        fontSize: '0.75em',
        verticalAlign: 'middle',
        backgroundColor: 'var(--color-button-secondary)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Pill;
