import React from 'react';

import ThemeToggle from '@widgets/controls/selectors/ThemeToggle.tsx';

const PageBrightnessSelector: React.FC = () => {
  return (
    <>
      <div className="text-right">Page Brightness</div>
      <ThemeToggle />
    </>
  );
};

export default PageBrightnessSelector;
