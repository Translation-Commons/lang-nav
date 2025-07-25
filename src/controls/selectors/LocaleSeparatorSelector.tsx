import React from 'react';

import { LocaleSeparator } from '../../types/PageParamTypes';
import Selector, { OptionsDisplay } from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const LocaleSeparatorSelector: React.FC = () => {
  const { localeSeparator, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Locale Separator:"
      selectorDescription="Choose the separator in locale codes, eg. 'ar-EG' or 'ar_EG'"
      options={['_', '-']}
      optionsDisplay={OptionsDisplay.ButtonList}
      onChange={(localeSeparator: LocaleSeparator) => updatePageParams({ localeSeparator })}
      selected={localeSeparator}
    />
  );
};

export default LocaleSeparatorSelector;
