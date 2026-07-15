import React from 'react';

import Deemphasized from '@shared/ui/old/Deemphasized';

const DetailsStatBlock: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={{ fontSize: '2em', fontWeight: 700, lineHeight: 1 }}>{children}</div>
    <Deemphasized>{label}</Deemphasized>
  </div>
);

export default DetailsStatBlock;
