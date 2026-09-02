import { SearchIcon } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { FeedbackForm } from '@features/feedback/FeedbackForm';
import PopupCard from '@features/layers/popupcard/PopupCard';
import InternalLink from '@features/params/InternalLink';
import usePageParams from '@features/params/usePageParams';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import NavBarToolsMenu from './controls/NavBarToolsMenu';
import SettingsButton from './controls/SettingsButton';

const SearchBar = React.lazy(() => import('@features/transforms/search/SearchBar'));

const PageNavBar: React.FC = () => {
  const { pageBrightness } = usePageParams().brightness;

  return (
    <nav className="flex flex-wrap items-center gap-x-2 text-lg text-(--color-text-on-color) bg-(--color-button-primary)">
      <NavBarTitle>
        <img
          src={`${import.meta.env.BASE_URL}logo/LangNavLogoNavBar${pageBrightness === 'dark' ? 'Dark' : ''}.svg`}
          width="60px"
          alt="LangNav Logo"
        />
        <span className="hidden sm:inline md:hidden">
          <strong>LangNav</strong> <em>β</em>
        </span>
        <span className="hidden md:inline">
          <strong>Lang</strong>uage <strong>Nav</strong>igator <em>β</em>
        </span>
      </NavBarTitle>
      <NavBarLink path={'/' + LangNavPageName.Data}>Data</NavBarLink>
      <NavBarLink path={'/' + LangNavPageName.About}>About</NavBarLink>
      <NavBarToolsMenu />
      <ContainErrorsAndSuspense>
        <PopupCard
          buttonClassName="primary lg:hidden"
          buttonLabel={<SearchIcon />}
          buttonStyle={{ padding: '8px' }}
          justifyCard="center"
          body={<SearchBar />}
        />
        <div className="flex-1">
          <div className="hidden lg:flex">
            <SearchBar />
          </div>
        </div>
      </ContainErrorsAndSuspense>
      <FeedbackForm />
      <SettingsButton />
    </nav>
  );
};

const NavBarLink: React.FC<React.PropsWithChildren<{ path: string }>> = ({ path, children }) => {
  return (
    <NavLink
      className="primary text-xl p-2 rounded-sm hover:bg-(--color-button-hover) active:no-underline"
      to={path}
      style={({ isActive }) => ({
        textDecoration: 'none',
        fontWeight: isActive ? 'bold' : 'lighter',
      })}
    >
      {children}
    </NavLink>
  );
};

const NavBarTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <InternalLink
      className="primary flex gap-1 items-center text-2xl p-2 rounded-sm hover:bg-(--color-button-hover) active:no-underline overflow-nowrap"
      page={LangNavPageName.Intro}
    >
      {children}
    </InternalLink>
  );
};

export default PageNavBar;
