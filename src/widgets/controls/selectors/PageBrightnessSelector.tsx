import React from 'react';

import { PageBrightnessPreference, usePageBrightness } from '@shared/hooks/usePageBrightness';
import { toTitleCase } from '@shared/lib/stringUtils';

import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

const PageBrightnessSelector: React.FC = () => {
  //   const { PageBrightness, updatePageParams, objectType } = usePageParams();
  const { preference, setPreference } = usePageBrightness();
  //   const (theme, setPageBrightness) = useStoredParams('theme', PageBrightnessPreference);

  return (
    <Selector<PageBrightnessPreference>
      selectorLabel="Page Brightness"
      selectorDescription="Choose how bright the page should be. This parameter is stored on your device."
      options={['light', 'dark', 'follow device']}
      onChange={(preference: PageBrightnessPreference) => setPreference(preference)}
      selected={preference}
      display={SelectorDisplay.Dropdown}
      getOptionLabel={toTitleCase}
    />
  );
};

export default PageBrightnessSelector;
