import React from 'react';

const Deemphasized: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <span className="font-light text-muted-foreground italic">{children}</span>;
};

export default Deemphasized;
