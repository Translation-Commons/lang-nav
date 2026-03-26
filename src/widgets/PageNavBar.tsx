import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { LangNavPageName } from '@app/PageRoutes';

import { FeedbackForm } from '@features/feedback/FeedbackForm';
import InternalLink from '@features/params/InternalLink';
import SearchBar from '@features/transforms/search/SearchBar';

import { usePageBrightness } from '@shared/hooks/usePageBrightness';

const PageNavBar: React.FC = () => {
  const { pageBrightness } = usePageBrightness();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <NavBarContainer>
      <NavBarTitle>
        <img
          src={`/lang-nav/logo/LangNavLogoNavBar${pageBrightness === 'dark' ? 'Dark' : ''}.svg`}
          width="60px"
          alt="LangNav Logo"
        />
        <span>
          <strong>Lang</strong>uage <strong>Nav</strong>igator <em>β</em>
        </span>
      </NavBarTitle>
      <NavBarLink path={'/' + LangNavPageName.Intro}>Intro</NavBarLink>
      <NavBarLink path={'/' + LangNavPageName.Data}>Data</NavBarLink>
      <NavBarLink path={'/' + LangNavPageName.About}>About</NavBarLink>
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <SearchBar />
      </div>
      <button
        className="primary"
        type="button"
        style={{ padding: '0.5em', whiteSpace: 'nowrap' }}
        onClick={() => setFeedbackOpen(true)}
      >
        Feedback
      </button>
      {feedbackOpen && <FeedbackForm onClose={() => setFeedbackOpen(false)} />}
    </NavBarContainer>
  );
};

const NavBarLink: React.FC<React.PropsWithChildren<{ path: string }>> = ({ path, children }) => {
  return (
    <button className="primary" style={{ padding: '0.5em .5em', margin: '0 0.5em' }}>
      <NavLink
        to={path}
        style={({ isActive }) => ({
          textDecoration: 'none',
          fontSize: '1.2em',
          fontWeight: isActive ? 'bold' : 'lighter',
        })}
      >
        {children}
      </NavLink>
    </button>
  );
};

const NavBarContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <nav
      className="NavBar"
      style={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: '0em',
        borderBottom: '0.125em solid var(--color-button-primary)',
        width: '100%',
        rowGap: '0.5em',
        color: 'var(--color-background)',
        backgroundColor: 'var(--color-button-primary)',
      }}
    >
      {children}
    </nav>
  );
};

const NavBarTitle: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <h1
      style={{
        fontSize: '1.5em',
        whiteSpace: 'nowrap',
        lineHeight: '1.5',
        margin: '0em 0.5em',
        display: 'flex',
        alignItems: 'center',
        marginLeft: '0.25em',
        gap: '0.25em',
      }}
    >
      <InternalLink
        page={LangNavPageName.Intro}
        style={{ alignItems: 'center', display: 'flex', gap: '0.25em' }}
      >
        {children}
      </InternalLink>
    </h1>
  );
};

export default PageNavBar;
