import React from 'react';

import CommonObjectives from '@widgets/CommonObjectives';
import LargeLangNavLogo from '@widgets/docs/LargeLangNavLogo';

const IntroPage: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-4 text-center sm:px-6">
      <div className="mt-4 flex justify-center">
        <LargeLangNavLogo width={240} className="h-auto w-40 max-w-full sm:w-52 md:w-60" />
      </div>
      <h1 className="my-4 text-3xl font-normal sm:text-4xl md:text-5xl">
        Welcome to the <strong>Lang</strong>uage <strong>Nav</strong>igator
      </h1>
      <p className="mx-auto text-sm md:text-base max-w-5xl">
        This website is a comprehensive resource for exploring and understanding languages. It
        provides access to a wide range of linguistic data, including language classification,
        geographic distribution, digital support, and writing systems. The website is in beta{' '}
        <em>β</em> mode -- meaning that most functionality is present but there still may be errors,
        particularly with data.
      </p>
      <p className="mx-auto text-sm md:text-base mt-4">
        To get started, click on the &quot;Data&quot; tab in the navigation bar above. Or, choose
        from the common objectives below.
      </p>
      <CommonObjectives />
    </div>
  );
};

export default IntroPage;
