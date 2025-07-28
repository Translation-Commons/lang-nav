import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const PageNavBar: React.FC = () => {
  return (
    <NavBarContainer>
      <NavBarTitle>
        <img src="LangNavLogoNavBar.svg" width="60px" alt="LangNav Logo" />
        <span>
          <strong>Lang</strong>uage <strong>Nav</strong>igator
        </span>
      </NavBarTitle>
      {/* <NavBarLink path="/intro">Intro</NavBarLink> */}
      <NavBarLink path="/data">Data</NavBarLink>
      {/* <NavBarLink path="/details">Details</NavBarLink> */}
      <NavBarLink path="/about">About</NavBarLink>
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
      <Link to="/" style={{ alignItems: 'center', display: 'flex', gap: '0.25em' }}>
        {children}
      </Link>
    </h1>
  );
};

export default PageNavBar;
