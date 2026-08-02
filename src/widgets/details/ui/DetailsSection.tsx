import React, { PropsWithChildren, ReactNode } from 'react';

import '../details.css';

const DetailsSection: React.FC<PropsWithChildren<{ title: ReactNode }>> = ({ children, title }) => {
  return (
    <div className="DetailsSection">
      <h3 className="DetailsSectionTitle">{title}</h3>
      {children}
    </div>
  );
};

export default DetailsSection;
