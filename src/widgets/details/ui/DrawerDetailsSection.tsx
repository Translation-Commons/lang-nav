import React from 'react';

type SectionProps = React.PropsWithChildren<{ title: string }>;

export const DrawerDetailsSection: React.FC<SectionProps> = ({ children, title }) => {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card/30">
      <h2 className="border-b border-border bg-muted/30 px-3 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <dl className="divide-y divide-border">{children}</dl>
    </section>
  );
};

type FieldProps = React.PropsWithChildren<{ label: string; actions?: React.ReactNode }>;

export const DrawerDetailsField: React.FC<FieldProps> = ({ children, label, actions }) => {
  return (
    <div className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-3 px-3 py-2 text-xs/relaxed">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-foreground">
        <div className="flex flex-row gap-1 items-center justify-between">
          <div>{children ?? '—'}</div>
          {actions && <div>{actions}</div>}
        </div>
      </dd>
    </div>
  );
};
