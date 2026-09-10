import React from 'react';

const CodeDisplay: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <span className="font-mono text-[10px] text-muted-foreground">{children}</span>;
};

export default CodeDisplay;
