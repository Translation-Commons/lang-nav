import { SettingsIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover';

import Settings from './Settings';

const SettingsButton = (): React.ReactNode => {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon-lg" aria-label="View settings">
            <SettingsIcon />
          </Button>
        }
      />
      <PopoverContent align="end">
        <Settings />
      </PopoverContent>
    </Popover>
  );
};

export default SettingsButton;
