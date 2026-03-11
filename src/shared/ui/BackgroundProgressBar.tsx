import React from 'react';

const BackgroundProgressBar: React.FC<
  React.PropsWithChildren<{ percentage: number; backgroundColor?: string }>
> = ({ percentage, backgroundColor = 'var(--color-button-secondary)', children }) => {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          zIndex: -1,
          top: 0,
          left: 0,
          height: '100%',
          width: `${percentage}%`,
          backgroundColor,
        }}
      />
      {children}
    </div>
  );
};

export default BackgroundProgressBar;
