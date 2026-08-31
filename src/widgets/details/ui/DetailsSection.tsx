import { ChevronRightIcon } from 'lucide-react';
import React, { PropsWithChildren, ReactNode } from 'react';

import { Toggle } from '@shared/ui/toggle';

type Props = {
  headerOptions?: ReactNode;
  score?: string | number;
  title: string;
  startCollapsed?: boolean;
  isCollapsible?: boolean;
};

const DetailsSection: React.FC<PropsWithChildren<Props>> = ({
  children,
  headerOptions,
  startCollapsed = false,
  isCollapsible = true,
  score,
  title,
}) => {
  const [isOpen, setIsOpen] = React.useState(!startCollapsed);
  // if the section is in the URL anchor
  React.useEffect(() => {
    if (window.location.hash === '#details-' + encodeURIComponent(title)) {
      setIsOpen(true);
    }
  }, [title]);

  return (
    <div className="flex flex-col mb-4 h-full box-border border border-[--color-button-secondary] rounded-xl">
      <div
        role="heading"
        className={
          'p-4 rounded-md flex flex-row justify-between' +
          (isCollapsible ? ' hover:bg-accent cursor-pointer' : '')
        }
        aria-level={2}
        aria-label={title}
        id={'details-' + encodeURIComponent(title)}
        onClick={() => isCollapsible && setIsOpen((prev) => !prev)}
      >
        <span className="uppercase text-xl tracking-tight">
          {title}
          {score != null && score !== '' && ` (${score})`}
        </span>
        <div className="flex items-center gap-2 self-start">
          <div
            onClick={(e) => {
              // Only allows clicking the header options to open the section, otherwise someone switching views could close the panel when they just want a different option
              e.stopPropagation();
              setIsOpen(true);
            }}
          >
            {headerOptions}
          </div>
          {isCollapsible && (
            <Toggle
              aria-label={isOpen ? 'Collapse section' : 'Expand section'}
              className="cursor-pointer px-0 hover:bg-accent!"
              pressed={isOpen}
              variant="outline"
            >
              <ChevronRightIcon className="transition-transform group-aria-pressed/toggle:rotate-90" />
            </Toggle>
          )}
        </div>
      </div>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

export default DetailsSection;
