import React from 'react';

import { getNewURL } from '../controls/PageParamsContext';
import { DEFAULTS_BY_PROFILE, getProfileIcon, ProfileType } from '../controls/Profiles';
import { PageParamsOptional } from '../types/PageParamTypes';

const IntroPage: React.FC = () => {
  return (
    <IntroPageContainer>
      <img
        src="LangNavLogo.svg"
        width="240px"
        height="120px"
        alt="LangNav Logo"
        style={{ marginTop: '1.5em' }}
      />
      <div style={{ margin: '.5em 0', fontSize: '3em' }}>
        Welcome to the <strong>Lang</strong>uage <strong>Nav</strong>igator
      </div>
      <p>
        This website is a comprehensive resource for exploring and understanding languages. It
        provides access to a wide range of linguistic data, including language classification,
        geographic distribution, digital support, and writing systems.
      </p>
      <p>
        To get started, click on the &quot;Data&quot; tab in the navigation bar above. Or select a
        profile that matches your interests -- this will configure some page settings to get you
        closer to what you probably want to see.
      </p>
      <div>
        {Object.values(ProfileType).map((profile) => (
          <LangNavProfile
            key={profile}
            icon={getProfileIcon(profile, 'var(--color-text)')}
            urlParams={DEFAULTS_BY_PROFILE[profile]}
          >
            {profile}
          </LangNavProfile>
        ))}
      </div>
    </IntroPageContainer>
  );
};

function IntroPageContainer({ children }: React.PropsWithChildren) {
  return (
    <div
      style={{
        padding: '1em',
        textAlign: 'center',
        minHeight: '80vh',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}

type LangNavProfileProps = {
  icon: React.ReactNode;
  urlParams?: PageParamsOptional;
};

const LangNavProfile: React.FC<React.PropsWithChildren<LangNavProfileProps>> = ({
  children,
  urlParams,
  icon,
}) => {
  return (
    <a href={`data${getNewURL(urlParams ?? {})}`}>
      <button style={{ padding: '0.5em 1em', margin: '0.5em', borderRadius: '1em' }}>
        {icon && <div>{icon}</div>}
        {children}
      </button>
    </a>
  );
};

export default IntroPage;
