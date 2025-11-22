import React from 'react';

import { LocaleSeparator } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

const LocaleSeparatorSelector: React.FC = () => {
  const { localeSeparator, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Locale Separator"
      selectorDescription="Choose the separator in locale codes, eg. 'ar-EG' or 'ar_EG'"
      options={Object.values(LocaleSeparator)}
      onChange={(localeSeparator: LocaleSeparator) => updatePageParams({ localeSeparator })}
      selected={localeSeparator}
    />
  );
};

export default LocaleSeparatorSelector;
