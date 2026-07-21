import { ChevronDownIcon } from 'lucide-react';
import React, { ReactNode } from 'react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shared/ui/collapsible';

const CollapsibleReport: React.FC<{
  children: React.ReactNode;
  title: ReactNode;
}> = ({ title, children }) => {
  return (
    <Collapsible defaultOpen className="group/report">
      <CollapsibleTrigger
        render={
          <button className="flex w-full cursor-pointer items-center gap-2 rounded-lg bg-secondary px-2 py-2 text-left text-lg text-secondary-foreground transition-colors hover:bg-secondary/80" />
        }
      >
        <ChevronDownIcon className="size-4 shrink-0 transition-transform group-data-[closed]/report:-rotate-90" />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default CollapsibleReport;
