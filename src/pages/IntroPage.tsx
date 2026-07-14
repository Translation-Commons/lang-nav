import React, { useRef } from 'react';

import CommonObjectives from '@widgets/CommonObjectives';

import ContainErrorsAndSuspense from '@shared/containers/ContainErrorsAndSuspense';

import IntroHeroSection from './intro/IntroHeroSection';
import IntroScrollContainer from './intro/IntroScrollContainer';
import IntroScrollSection from './intro/IntroScrollSection';
import IntroSectionNav from './intro/IntroSectionNav';
import { useIntroSectionNav } from './intro/useIntroSectionNav';

// Lazy-loaded so the map's d3 dependencies stay out of the initial bundle for this
// (likely the app's most-visited) landing route, matching DataPageBody's precedent.
const IntroMapSection = React.lazy(() => import('./intro/IntroMapSection'));

const SECTION_LABELS = ['Home', 'Map', 'Common Objectives'];

const IntroPage: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { activeIndex, scrollToSection } = useIntroSectionNav(scrollRef, SECTION_LABELS.length);

  return (
    <>
      <IntroScrollContainer ref={scrollRef}>
        <IntroScrollSection animate={false}>
          <IntroHeroSection onScrollDown={() => scrollToSection(1)} />
        </IntroScrollSection>
        <IntroScrollSection>
          <ContainErrorsAndSuspense>
            <IntroMapSection />
          </ContainErrorsAndSuspense>
        </IntroScrollSection>
        <IntroScrollSection align="top">
          <CommonObjectives />
        </IntroScrollSection>
      </IntroScrollContainer>
      <IntroSectionNav
        labels={SECTION_LABELS}
        activeIndex={activeIndex}
        onSelect={scrollToSection}
      />
    </>
  );
};

export default IntroPage;
