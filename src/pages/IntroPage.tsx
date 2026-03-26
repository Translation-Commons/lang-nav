import React from 'react';

import CommonObjectives from '@widgets/CommonObjectives';
import LargeLangNavLogo from '@widgets/docs/LargeLangNavLogo';

const IntroPage: React.FC = () => {
  return (
    <IntroPageContainer>
      <div style={{ marginTop: '1em' }}>
        <LargeLangNavLogo width={240} />
      </div>
      <div style={{ margin: '.5em 0', fontSize: '3em' }}>
        Welcome to the <strong>Lang</strong>uage <strong>Nav</strong>igator
      </div>
      <p>
        This website is a comprehensive resource for exploring and understanding languages. It
        provides access to a wide range of linguistic data, including language classification,
        geographic distribution, digital support, and writing systems. The website is in beta{' '}
        <em>β</em> mode -- meaning that most functionality is present but there still may be errors,
        particularly with data.
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
