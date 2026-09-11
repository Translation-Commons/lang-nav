import { MenuIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@shared/ui/drawer';

import { navBarLinkClassName } from './NavBarLink';
import { getToolURL, NAV_BAR_TOOLS, useIsToolOpen } from './navBarTools';

const NavMenuDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="left">
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon-lg" aria-label="Open menu" className="sm:hidden">
            <MenuIcon className="size-5" />
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between border-b pb-3">
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerClose
            aria-label="Close menu"
            render={
              <Button variant="ghost" size="icon-sm">
                <XIcon />
              </Button>
            }
          />
        </DrawerHeader>
        <nav className="flex flex-col gap-1 p-3">
          <PageLink page={LangNavPageName.Data} onNavigate={close}>
            Data
          </PageLink>
          <ToolsGroup onNavigate={close} />
          <PageLink page={LangNavPageName.About} onNavigate={close}>
            About
          </PageLink>
        </nav>
      </DrawerContent>
    </Drawer>
  );
};

const ToolsGroup: React.FC<{ onNavigate: () => void }> = ({ onNavigate }) => {
  const isToolOpen = useIsToolOpen();

  return (
    <div role="group" aria-labelledby="nav-menu-tools-label">
      <div
        id="nav-menu-tools-label"
        className="px-2.5 pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase"
      >
        Tools
      </div>
      <div className="ml-4 flex flex-col gap-1 border-l-2 border-border pl-2">
        {NAV_BAR_TOOLS.map((tool) => (
          <Link
            key={tool.label}
            to={getToolURL(tool)}
            data-slot="button"
            onClick={onNavigate}
            aria-current={isToolOpen(tool) ? 'page' : undefined}
            className={cn(navBarLinkClassName(isToolOpen(tool)), 'justify-start')}
          >
            {tool.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

type PageLinkProps = React.PropsWithChildren<{ page: LangNavPageName; onNavigate: () => void }>;

const PageLink: React.FC<PageLinkProps> = ({ page, onNavigate, children }) => {
  return (
    <NavLink
      to={'/' + page}
      data-slot="button"
      onClick={onNavigate}
      className={({ isActive }) => cn(navBarLinkClassName(isActive), 'justify-start')}
    >
      {children}
    </NavLink>
  );
};

export default NavMenuDrawer;
