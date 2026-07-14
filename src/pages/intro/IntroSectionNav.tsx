import React from 'react';

type Props = {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

const IntroSectionNav: React.FC<Props> = ({ labels, activeIndex, onSelect }) => {
  return (
    <nav className="IntroSectionNav" aria-label="Page sections">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          className={'IntroSectionNavDot' + (index === activeIndex ? ' active' : '')}
          aria-label={`Go to ${label}`}
          aria-current={index === activeIndex ? 'true' : undefined}
          onClick={(e) => {
            onSelect(index);
            // Otherwise the button keeps focus after the click, and the app's global
            // button:focus rule (matching :hover styling) makes it look permanently
            // "stuck" hovered/active until focus moves elsewhere.
            e.currentTarget.blur();
          }}
        />
      ))}
    </nav>
  );
};

export default IntroSectionNav;
