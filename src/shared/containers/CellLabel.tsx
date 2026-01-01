import React from 'react';

const LabelTableCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th style={{ fontWeight: 'bold', textAlign: 'left' }}>{children}</th>
);

export default LabelTableCell;
