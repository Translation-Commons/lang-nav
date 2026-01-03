import React from 'react';

type Props = React.PropsWithChildren<{
  align?: 'left' | 'center' | 'right';
}>;

const LabelTableCell: React.FC<Props> = ({ children, align = 'left' }) => (
  <th style={{ fontWeight: 'bold', textAlign: align }}>{children}</th>
);

export default LabelTableCell;
