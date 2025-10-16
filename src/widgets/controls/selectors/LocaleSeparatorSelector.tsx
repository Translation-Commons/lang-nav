import React from 'react';

import { LocaleSeparator } from '@widgets/PageParamTypes';

import { usePageParams } from '../../PageParamsProvider';
import Selector from '../components/Selector';
import { SelectorDisplay } from '../components/SelectorDisplay';

const LocaleSeparatorSelector: React.FC = () => {
  const { localeSeparator, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Locale Separator"
      selectorDescription="Choose the separator in locale codes, eg. 'ar-EG' or 'ar_EG'"
      options={Object.values(LocaleSeparator)}
      display={SelectorDisplay.ButtonGroup}
      onChange={(localeSeparator: LocaleSeparator) => updatePageParams({ localeSeparator })}
      selected={localeSeparator}
    />
  );
};

export default LocaleSeparatorSelector;
