import React from 'react';

import CommonObjectives from '@widgets/CommonObjectives';

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
        To get started, click on the &quot;Data&quot; tab in the navigation bar above. Or, choose
        from the common objectives below.
      </p>
      <CommonObjectives />
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

export default IntroPage;
