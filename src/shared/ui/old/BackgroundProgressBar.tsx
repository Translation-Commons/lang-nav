import React from 'react';

const BackgroundProgressBar: React.FC<
  React.PropsWithChildren<{ percentage: number; backgroundColor?: string }>
> = ({ percentage, backgroundColor = 'var(--color-button-secondary)', children }) => {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: 0,
          top: 0,
          left: 0,
          height: '100%',
          width: `${percentage}%`,
          backgroundColor,
        }}
      />
      <div style={{ zIndex: 1, position: 'relative' }}>{children}</div>
    </div>
  );
};

export default BackgroundProgressBar;
