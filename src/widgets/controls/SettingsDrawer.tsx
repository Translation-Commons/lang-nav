import { XIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@shared/ui/drawer';

import Settings from './Settings';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Non-modal so the underlying table/map stays interactive and updates live while
// settings are changed. Shared between the desktop gear and the mobile nav menu.
const SettingsDrawer: React.FC<Props> = ({ open, onOpenChange }) => {
  return (
    <Drawer
      modal={false}
      disablePointerDismissal={true}
      swipeDirection="right"
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between border-b px-2 py-0">
          <DrawerTitle className="my-3">Settings</DrawerTitle>
          <DrawerClose
            render={<Button variant="ghost" size="icon-sm" aria-label="Close settings" />}
          >
            <XIcon />
          </DrawerClose>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <Settings />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default SettingsDrawer;
