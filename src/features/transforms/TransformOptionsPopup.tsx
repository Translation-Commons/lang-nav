import React, { ReactNode } from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

type Props = {
  description?: ReactNode;
  isActive?: boolean;
  label: ReactNode;
  options: Record<string, ReactNode>;
  /** An icon-only square trigger that opens to the left, for the map's control column. */
  compactLabel?: string;
};

const TransformOptionsPopup: React.FC<Props> = ({
  description,
  isActive = true,
  label,
  options,
  compactLabel,
}) => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={compactLabel}
            title={compactLabel}
            className={
              compactLabel
                ? 'cursor-pointer h-8 w-8'
                : 'py-2 max-w-60 rounded-md flex items-center text-sm gap-2 cursor-pointer'
            }
            variant={getTriggerVariant(isActive, compactLabel != null)}
          >
            {label}
          </Button>
        }
      />
      <PopoverContent
        className="grid grid-cols-2 gap-2 items-center"
        side={compactLabel ? 'left' : 'bottom'}
      >
        {description && <div className="col-span-2">{description}</div>}
        {Object.entries(options).map(([label, component]) => (
          <React.Fragment key={label}>
            <div className="text-right">{label}</div>
            {component}
          </React.Fragment>
        ))}
      </PopoverContent>
    </Popover>
  );
};

function getTriggerVariant(isActive: boolean, isCompact: boolean) {
  // The compact trigger sits with the map's buttons, so it matches their look.
  if (isCompact) return isActive ? 'active' : 'secondary';
  return isActive ? 'default' : 'outline';
}

export default TransformOptionsPopup;
