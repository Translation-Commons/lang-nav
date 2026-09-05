import { SettingsIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import Settings from './Settings';

const SettingsButton = (): React.ReactNode => {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          aria-label="View settings"
          size="lg"
          className="py-2 rounded-md h-full hover:bg-accent/10 "
        >
          <SettingsIcon className="size-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Settings />
      </PopoverContent>
    </Popover>
  );
};

export default SettingsButton;
