import React from 'react';

const DetailsStatBlock: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/40 p-3">
    <div className="text-2xl leading-none font-bold">{children}</div>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

export default DetailsStatBlock;
