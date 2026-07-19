import { MenuIcon, SettingsIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { FeedbackForm } from '@features/feedback/FeedbackForm';
import InternalLink from '@features/params/InternalLink';
import usePageParams from '@features/params/usePageParams';
import SearchBar from '@features/transforms/search/SearchBar';

import { Button } from '@shared/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@shared/ui/drawer';
import { Separator } from '@shared/ui/separator';

import SettingsDrawer from './controls/SettingsDrawer';

const NAV_LINKS: { path: LangNavPageName; label: string }[] = [
  { path: LangNavPageName.Intro, label: 'Intro' },
  { path: LangNavPageName.Data, label: 'Data' },
  { path: LangNavPageName.About, label: 'About' },
];

// Shared styling for interactive items sitting on the primary-colored navbar.
const navItemClass =
  'rounded-md px-2.5 py-1 text-base text-primary-foreground/90 transition-colors hover:bg-white/15';

const PageNavBar: React.FC = () => {
  const { pageBrightness } = usePageParams().brightness;
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const openSettingsFromMenu = () => {
    setMenuOpen(false);
    setSettingsOpen(true);
  };

  return (
    <nav className="relative flex w-full flex-wrap items-center gap-y-2 border-b-2 border-primary bg-primary py-1 text-primary-foreground">
      <NavBarTitle brightness={pageBrightness} />

      {/* Desktop-only inline page links */}
      <div className="ml-2 hidden items-center gap-1 md:flex">
        {NAV_LINKS.map(({ path, label }) => (
          <NavBarLink key={path} path={'/' + path}>
            {label}
          </NavBarLink>
        ))}
      </div>

      {/* Search: own full-width centered row below md; in-flow centered on md; centered on the
          window axis (absolute) once the viewport is wide enough to not overlap links/controls. */}
      <div className="order-last flex w-full min-w-0 justify-center pb-1.5 md:order-none md:w-auto md:flex-1 md:pb-0 min-[92rem]:absolute min-[92rem]:top-1/2 min-[92rem]:left-1/2 min-[92rem]:w-auto min-[92rem]:max-w-md min-[92rem]:flex-none min-[92rem]:-translate-x-1/2 min-[92rem]:-translate-y-1/2">
        <SearchBar />
      </div>

      {/* Desktop-only right controls */}
      <div className="mr-2 ml-auto hidden items-center gap-2 md:flex">
        <FeedbackForm triggerClassName={navItemClass} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-primary-foreground hover:bg-white/15"
          aria-label="View settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon />
        </Button>
      </div>

      {/* Mobile/tablet hamburger */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mr-2 ml-auto text-primary-foreground hover:bg-white/15 md:hidden"
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
      >
        <MenuIcon />
      </Button>

      <NavMenuDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenSettings={openSettingsFromMenu}
      />
      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </nav>
  );
};

const NavBarTitle: React.FC<{ brightness: string }> = ({ brightness }) => {
  return (
    <div className="mx-2 flex items-center gap-1 text-2xl leading-tight whitespace-nowrap">
      <InternalLink
        page={LangNavPageName.Intro}
        className="flex items-center gap-1 text-primary-foreground no-underline hover:no-underline"
      >
        <img
          src={`/lang-nav/logo/LangNavLogoNavBar${brightness === 'dark' ? 'Dark' : ''}.svg`}
          width="48px"
          alt="LangNav Logo"
        />
        <span>
          <strong>Lang</strong>uage <strong>Nav</strong>igator <em>β</em>
        </span>
      </InternalLink>
    </div>
  );
};

const NavBarLink: React.FC<React.PropsWithChildren<{ path: string }>> = ({ path, children }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `${navItemClass} no-underline hover:no-underline ${isActive ? 'font-bold text-primary-foreground' : 'font-light'}`
      }
    >
      {children}
    </NavLink>
  );
};

type NavMenuDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
};

// Collapsed menu shown below md: page links plus Feedback and Settings entries.
const NavMenuDrawer: React.FC<NavMenuDrawerProps> = ({ open, onOpenChange, onOpenSettings }) => {
  return (
    <Drawer swipeDirection="right" open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between border-b">
          <DrawerTitle>Menu</DrawerTitle>
          <DrawerClose render={<Button variant="ghost" size="icon-sm" aria-label="Close menu" />}>
            <XIcon />
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-col gap-1 p-3">
          {NAV_LINKS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={'/' + path}
              onClick={() => onOpenChange(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-base no-underline hover:bg-accent hover:no-underline ${isActive ? 'font-bold' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          <Separator className="my-1" />
          <FeedbackForm triggerClassName="w-full justify-start rounded-md px-3 py-2 text-left text-base hover:bg-accent" />
          <button
            type="button"
            className="rounded-md px-3 py-2 text-left text-base hover:bg-accent"
            onClick={onOpenSettings}
          >
            Settings
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PageNavBar;
