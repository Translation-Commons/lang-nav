import React from 'react';

import Selector from '@features/params/ui/Selector';

import { PageBrightnessPreference, usePageBrightness } from '@shared/hooks/usePageBrightness';
import { toSentenceCase } from '@shared/lib/stringUtils';

const PageBrightnessSelector: React.FC = () => {
  const { preference, setPreference } = usePageBrightness();

  return (
    <Selector<PageBrightnessPreference>
      selectorLabel="Page Brightness"
      selectorDescription="Choose how bright the page should be. This parameter is stored on your device."
      options={['light', 'dark', 'follow device']}
      onChange={(preference: PageBrightnessPreference) => setPreference(preference)}
      selected={preference}
      getOptionLabel={toSentenceCase}
    />
  );
};

export default PageBrightnessSelector;
