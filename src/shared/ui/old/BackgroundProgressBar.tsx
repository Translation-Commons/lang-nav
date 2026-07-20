import React from 'react';

const BackgroundProgressBar: React.FC<
  React.PropsWithChildren<{ percentage: number; backgroundColor?: string }>
> = ({ percentage, backgroundColor = 'var(--secondary)', children }) => {
  return (
    <div className="relative">
      <div
        className="absolute inset-y-0 left-0 z-0"
        style={{ width: `${percentage}%`, backgroundColor }}
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};

export default BackgroundProgressBar;
