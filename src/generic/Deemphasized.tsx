import React from 'react';

const Deemphasized: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <span className="deemphasized">{children}</span>;
};
export default Deemphasized;
