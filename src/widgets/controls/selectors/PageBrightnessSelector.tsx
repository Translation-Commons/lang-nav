import React from 'react';

import ThemeToggle from '@widgets/controls/selectors/ThemeToggle.tsx';

import SelectorLabel from '@features/params/ui/SelectorLabel.tsx';

const PageBrightnessSelector: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
      <SelectorLabel
        label="Page Brightness"
        description="Choose how bright the page should be. This parameter is stored on your device."
      />
      <ThemeToggle />
    </div>
  );
};

export default PageBrightnessSelector;
