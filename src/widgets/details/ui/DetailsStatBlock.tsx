import React from 'react';

import Deemphasized from '@shared/ui/Deemphasized';

const DetailsStatBlock: React.FC<{ label: React.ReactNode; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col items-center">
    <div className="text-3xl font-bold">{children}</div>
    <Deemphasized>{label}</Deemphasized>
  </div>
);

export default DetailsStatBlock;
