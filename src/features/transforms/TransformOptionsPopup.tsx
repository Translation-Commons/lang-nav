import React, { ReactNode } from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

type Props = {
  description: ReactNode;
  isActive?: boolean;
  label: ReactNode;
  options: Record<string, ReactNode>;
};

const TransformOptionsPopup: React.FC<Props> = ({
  description,
  isActive = true,
  label,
  options,
}) => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            className="py-2 max-w-60 rounded-md flex items-center text-sm gap-2 cursor-pointer"
            variant={isActive ? 'default' : 'outline'}
          >
            {label}
          </Button>
        }
      />
      <PopoverContent className="grid grid-cols-2 gap-2 items-center">
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

export default TransformOptionsPopup;
