import React from 'react';

interface Props {
  children: React.ReactNode;
}

const ViewCard: React.FC<Props> = ({ children }) => {
  return <div className="ViewCard">{children}</div>;
};

export default ViewCard;
