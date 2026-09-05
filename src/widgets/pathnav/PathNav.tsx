import React from 'react';

export const PathContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={'flex items-center gap-2 flex-wrap ' + (className ?? '')}>{children}</div>;
};
