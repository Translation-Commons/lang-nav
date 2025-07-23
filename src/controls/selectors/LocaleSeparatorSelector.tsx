import React from 'react';

import { LocaleSeparator } from '../../types/PageParamTypes';
import Selector, { SelectorAppearance } from '../components/Selector';
import SingleChoiceOptions from '../components/SingleChoiceOptions';
import { usePageParams } from '../PageParamsContext';

const LocaleSeparatorSelector: React.FC = () => {
  const { localeSeparator, updatePageParams } = usePageParams();

  return (
    <Selector
      appearance={SelectorAppearance.List}
      selectorLabel="Locale Separator"
      selectorDescription="Choose the separator in locale codes, eg. 'ar-EG' or 'ar_EG'"
    >
      <SingleChoiceOptions<LocaleSeparator>
        mode="flat"
        options={['_', '-']}
        onChange={(localeSeparator: LocaleSeparator) => updatePageParams({ localeSeparator })}
        selected={localeSeparator}
      />
    </Selector>
  );
};

export default LocaleSeparatorSelector;
