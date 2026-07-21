import React from 'react';

import ThemeToggle from '@widgets/controls/selectors/ThemeToggle.tsx';

import SelectorLabel from '@features/params/ui/SelectorLabel.tsx';

const PageBrightnessSelector: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center">
      <SelectorLabel
        label="Page Brightness"
        description="Choose how bright the page should be. This parameter is stored on your device."
      />
      <div className="w-22 rounded-full bg-primary text-primary-foreground">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default PageBrightnessSelector;
