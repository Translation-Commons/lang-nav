import { ChevronRightIcon } from 'lucide-react';
import React, { PropsWithChildren, useId, useState } from 'react';

import { Button } from '@shared/ui/button';

import DigitalSupportStatusIcon, { getDigitalSupportStatusColor } from './DigitalSupportStatusIcon';
import { DigitalSupportStatusSummary } from './DigitalSupportTypes';

type Props = PropsWithChildren<{
  summary: DigitalSupportStatusSummary;
  title: string;
  /**
   * Allow the title and status label to wrap onto multiple lines instead of truncating. Useful
   * in narrow containers such as the details drawer where longer statuses would otherwise be cut.
   */
  allowWrap?: boolean;
}>;

/** One capability: a scannable status line that expands to show the evidence behind it. */
const DigitalSupportCategoryRow: React.FC<Props> = ({
  children,
  summary,
  title,
  allowWrap = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  return (
    <li className="border-b border-(--color-button-secondary) last:border-b-0">
      <Button
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className={
          'w-full h-auto justify-start gap-2 px-2 py-2 text-sm cursor-pointer' +
          // The shared button sets `whitespace-nowrap`; override it so long statuses wrap
          // instead of overflowing and overlapping the category name in the narrow drawer.
          (allowWrap ? ' items-start whitespace-normal' : '')
        }
        onClick={() => setIsExpanded((prev) => !prev)}
        variant="ghost"
      >
        <span className={'flex shrink-0' + (allowWrap ? ' mt-[0.15em]' : '')}>
          <DigitalSupportStatusIcon status={summary.status} />
        </span>
        <span className={'flex-1 min-w-0 text-left' + (allowWrap ? ' break-words' : ' truncate')}>
          {title}
        </span>
        <span
          className={'min-w-0' + (allowWrap ? ' basis-1/2 break-words text-right' : ' truncate')}
          style={{ color: getDigitalSupportStatusColor(summary.status) }}
        >
          {summary.label}
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          className={
            'shrink-0 transition-transform' +
            (allowWrap ? ' mt-[0.15em] text-muted-foreground' : '') +
            (isExpanded ? ' rotate-90' : '')
          }
        />
      </Button>
      <div className="pl-8 pr-2 pb-2 text-sm" id={contentId}>
        {isExpanded && children}
      </div>
    </li>
  );
};

export default DigitalSupportCategoryRow;
