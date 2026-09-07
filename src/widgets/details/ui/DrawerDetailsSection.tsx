import React from 'react';

type Props = React.PropsWithChildren<{ title: string }>;

const DrawerDetailsSection: React.FC<Props> = ({ children, title }) => {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card/30">
      <h2 className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <dl className="divide-y divide-border">{children}</dl>
    </section>
  );
};

export default DrawerDetailsSection;
