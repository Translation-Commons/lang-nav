import { ChevronRightIcon, CopyIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { PageParamsContext } from '@features/params/PageParamsContext';
import usePageParams from '@features/params/usePageParams';

import { reactNodeToString } from '@shared/lib/stringExportUtils';
import { Button } from '@shared/ui/button';

type FieldProps = React.PropsWithChildren<{
  label: string;
  actions?: React.ReactNode;
  hasData?: boolean;
  expandedContent?: React.ReactNode;
}>;

const DrawerDetailsField: React.FC<FieldProps> = ({
  children,
  label,
  actions,
  expandedContent,
  hasData = true,
}) => {
  const pageParams = usePageParams();
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (actions)
    expandedContent = (
      <>
        <div className="flex flex-row gap-2">{actions}</div>
        {expandedContent}
      </>
    );
  const copy = useCallback(() => {
    navigator.clipboard.writeText(
      reactNodeToString(
        <PageParamsContext.Provider value={pageParams}>{children}</PageParamsContext.Provider>,
      ),
    );
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

export default DrawerDetailsField;
