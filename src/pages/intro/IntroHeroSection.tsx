import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

import LargeLangNavLogo from '@widgets/docs/LargeLangNavLogo';

type Props = {
  onScrollDown?: () => void;
};

const IntroHeroSection: React.FC<Props> = ({ onScrollDown }) => {
  return (
    <div style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
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
        To get started, click on the &quot;Data&quot; tab in the navigation bar above, or scroll
        down to explore the map or common objectives.
      </p>
      {onScrollDown && (
        <button
          type="button"
          className="IntroScrollDownButton"
          onClick={(e) => {
            onScrollDown();
            // See the matching comment in IntroSectionNav — without this the button
            // stays focused and the global button:focus rule leaves it looking stuck
            // in a "hovered" blue state.
            e.currentTarget.blur();
          }}
          aria-label="Scroll down to explore the map"
        >
          <ChevronDownIcon size="2em" display="block" />
        </button>
      )}
    </div>
  );
};

export default IntroHeroSection;
