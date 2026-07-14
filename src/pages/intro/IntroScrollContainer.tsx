import React from 'react';

import './intro.css';

type Props = React.PropsWithChildren<{ ref?: React.Ref<HTMLDivElement> }>;

const IntroScrollContainer: React.FC<Props> = ({ children, ref }) => {
  return (
    <div ref={ref} className="IntroScrollContainer">
      {children}
    </div>
  );
};

export default IntroScrollContainer;
