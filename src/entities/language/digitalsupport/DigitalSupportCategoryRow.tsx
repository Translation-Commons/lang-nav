import { ChevronRightIcon } from 'lucide-react';
import React, { PropsWithChildren, useId, useState } from 'react';

import { Button } from '@shared/ui/button';

import DigitalSupportStatusIcon, { getDigitalSupportStatusColor } from './DigitalSupportStatusIcon';
import { DigitalSupportStatusSummary } from './DigitalSupportTypes';

type Props = PropsWithChildren<{
  summary: DigitalSupportStatusSummary;
  title: string;
}>;

/** One capability: a scannable status line that expands to show the evidence behind it. */
const DigitalSupportCategoryRow: React.FC<Props> = ({ children, summary, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentId = useId();

  return (
    <li className="border-b border-[--color-button-secondary] last:border-b-0">
      <Button
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className="w-full h-auto justify-start gap-2 px-2 py-2 text-sm cursor-pointer"
        onClick={() => setIsExpanded((prev) => !prev)}
        variant="ghost"
      >
        <DigitalSupportStatusIcon status={summary.status} />
        <span className="flex-1 min-w-0 truncate text-left">{title}</span>
        <span
          className="min-w-0 truncate"
          style={{ color: getDigitalSupportStatusColor(summary.status) }}
        >
          {summary.label}
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          className={'transition-transform' + (isExpanded ? ' rotate-90' : '')}
        />
      </Button>
      <div className="pl-8 pr-2 pb-2 text-sm" id={contentId}>
        {isExpanded && children}
      </div>
    </li>
  );
};

export default DigitalSupportCategoryRow;
