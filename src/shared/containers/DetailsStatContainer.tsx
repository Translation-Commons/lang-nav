import React from 'react';

const DetailsStatContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="mt-auto flex flex-wrap justify-center gap-4 pb-2">{children}</div>
);

export default DetailsStatContainer;
