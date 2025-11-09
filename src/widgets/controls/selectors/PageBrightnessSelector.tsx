import React from 'react';

import { PageBrightnessPreference, usePageBrightness } from '@shared/hooks/usePageBrightness';
import { toSentenceCase } from '@shared/lib/stringUtils';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

const PageBrightnessSelector: React.FC = () => {
  const { preference, setPreference } = usePageBrightness();

  return (
    <Selector<PageBrightnessPreference>
      selectorLabel="Page Brightness"
      selectorDescription="Choose how bright the page should be. This parameter is stored on your device."
      options={['light', 'dark', 'follow_device']}
      onChange={(preference: PageBrightnessPreference) => setPreference(preference)}
      selected={preference}
      display={SelectorDisplay.Dropdown}
      getOptionLabel={toSentenceCase}
    />
  );
};

export default PageBrightnessSelector;
