import React from 'react';

import { LangNavPageName } from '@app/PageRoutes';

import { FeedbackForm } from '@features/feedback/FeedbackForm';
import InternalLink from '@features/params/InternalLink';
import usePageParams from '@features/params/usePageParams';

import { Separator } from '@shared/ui/separator';

import NavBarLink from './controls/NavBarLink';
import NavBarToolsMenu from './controls/NavBarToolsMenu';
import NavMenuDrawer from './controls/NavMenuDrawer';
import SettingsButton from './controls/SettingsButton';

const PageNavBar: React.FC = () => {
  return (
    <nav className="flex h-12 shrink-0 items-center gap-1 border-b bg-background px-2 sm:h-14 sm:px-3">
      <NavMenuDrawer />
      <NavBarBrand />
      <Separator
        orientation="vertical"
        className="mx-1.5 hidden h-5 sm:block data-vertical:self-center"
      />
      <div className="hidden items-center gap-0.5 sm:flex">
        <NavBarLink page={LangNavPageName.Data}>Data</NavBarLink>
        <NavBarToolsMenu />
        <NavBarLink page={LangNavPageName.About}>About</NavBarLink>
      </div>
      <div className="ml-auto flex items-center gap-1">
        <FeedbackForm />
        <SettingsButton />
      </div>
    </nav>
  );
};

const NavBarBrand: React.FC = () => {
  const { pageBrightness } = usePageParams().brightness;
  const logoVariant = pageBrightness === 'dark' ? 'Dark' : '';

  return (
    <InternalLink
      page={LangNavPageName.Intro}
      className="flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 no-underline transition-colors hover:bg-muted hover:no-underline"
    >
      <img
        src={`${import.meta.env.BASE_URL}logo/LangNavLogo${logoVariant}.svg`}
        className="h-7 w-auto"
        alt="LangNav Logo"
      />
      <span className="hidden text-sm/tight whitespace-nowrap lg:inline">
        <strong className="font-semibold">Lang</strong>uage{' '}
        <strong className="font-semibold">Nav</strong>igator <em>β</em>
      </span>
    </InternalLink>
  );
};

export default PageNavBar;
