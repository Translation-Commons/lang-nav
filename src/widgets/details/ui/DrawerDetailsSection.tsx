import { ChevronRightIcon, CopyIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { reactNodeToString } from '@shared/lib/stringExportUtils';
import { Button } from '@shared/ui/button';

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

type FieldProps = React.PropsWithChildren<{
  label: string;
  actions?: React.ReactNode;
  hasData?: boolean;
  expandedContent?: React.ReactNode;
}>;

export const DrawerDetailsField: React.FC<FieldProps> = ({
  children,
  label,
  actions,
  expandedContent,
  hasData = true,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  if (actions)
    expandedContent = (
      <>
        <div className="flex flex-row gap-2">{actions}</div>
        {expandedContent}
      </>
    );
  const copy = useCallback(() => {
    navigator.clipboard.writeText(reactNodeToString(children));
  }, [children]);

  return (
    <div>
      <div
        className={
          'grid grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] gap-3 px-2 py-2 text-xs/relaxed items-center' +
          (hasData && expandedContent ? ' hover:bg-accent hover:cursor-pointer' : '')
        }
        onClick={() => hasData && expandedContent && setIsExpanded((prev) => !prev)}
      >
        <dt className="font-medium text-muted-foreground">{label}</dt>
        <dd className="min-w-0 wrap-break-word text-foreground">
          <div className="flex flex-row gap-1 items-center justify-between">
            <div className={!hasData ? 'text-muted-foreground italic' : ''}>{children ?? '—'}</div>
            {hasData && (
              <div onClick={(e) => e.stopPropagation()}>
                <Button onClick={copy} variant="ghost" size="icon-sm" className="p-1">
                  <CopyIcon />
                </Button>
                {expandedContent && (
                  <Button
                    onClick={() => setIsExpanded((prev) => !prev)}
                    variant="ghost"
                    size="icon-sm"
                    className="p-1"
                  >
                    <ChevronRightIcon
                      className={'transition-transform' + (isExpanded ? ' rotate-90' : '')}
                    />
                  </Button>
                )}
              </div>
            )}
          </div>
        </dd>
      </div>
      {hasData && isExpanded && expandedContent && (
        <div className="pl-8 pr-2 py-2 text-xs/relaxed flex flex-col gap-2">{expandedContent}</div>
      )}
    </div>
  );
};
