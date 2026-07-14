import React from 'react';

import { useRevealOnScroll } from '@shared/hooks/useRevealOnScroll';

type Props = React.PropsWithChildren<{
  // The hero section is visible on first paint without scrolling, so it should never
  // start hidden/faded (that would risk a flash-of-invisible-content on cold load).
  // Only sections revealed by scrolling should animate in.
  animate?: boolean;
  // 'center' vertically centers content in the viewport (the default, used for the
  // hero and map "slides"); 'top' anchors it near the top instead, for sections that
  // read more like a form/utility than a full-bleed scene.
  align?: 'center' | 'top';
}>;

const IntroScrollSection: React.FC<Props> = ({ animate = true, align = 'center', children }) => {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  const alignClass = align === 'top' ? ' IntroScrollSection--top' : '';

  if (!animate) {
    return <div className={'IntroScrollSection visible' + alignClass}>{children}</div>;
  }

  return (
    <div ref={ref} className={'IntroScrollSection' + (isVisible ? ' visible' : '') + alignClass}>
      {children}
    </div>
  );
};

export default IntroScrollSection;
