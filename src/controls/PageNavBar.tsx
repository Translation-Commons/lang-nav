import React from 'react';

import ObjectTypeSelector from './selectors/ObjectTypeNavBarSelector';
import ViewSelector from './selectors/ViewNavBarSelector';

import './controls.css';

const PageNavBar: React.FC = () => {
  return (
    <NavBarContainer>
      <NavBarTitle>
        <img src="LangNavLogoNavBar.svg" width="60px" alt="LangNav Logo" />
        <span>
          <strong>Lang</strong>uage <strong>Nav</strong>igator
        </span>
      </NavBarTitle>
      <ObjectTypeSelector />
      <ViewSelector />
    </NavBarContainer>
  );
};

const NavBarContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div
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
    </div>
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
      <a href="/lang-nav/" style={{ alignItems: 'center', display: 'flex', gap: '0.25em' }}>
        {children}
      </a>
    </h1>
  );
};

export default PageNavBar;
