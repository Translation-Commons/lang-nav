import React from 'react';

import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';

import { getLanguageModalityDescription, getModalityLabel } from '@strings/LanguageModalityStrings';

type Props = { display?: SelectorDisplay };

const LanguageModalitySelector: React.FC<Props> = ({ display }) => {
  const { modalityFilter, updatePageParams } = usePageParams();

  const selectorDescription =
    'Filter by how the language is primarily used: written, spoken, sign, or a combination.';

  return (
    <Selector
      selectorLabel="Modality"
      labelWhenEmpty="Any"
      selectorDescription={selectorDescription}
      options={
        Object.values(LanguageModality).filter((v) => typeof v === 'number') as LanguageModality[]
      }
      onChange={(modality: LanguageModality) =>
        modalityFilter.includes(modality)
          ? updatePageParams({
              modalityFilter: modalityFilter.filter((m) => m !== modality),
            })
          : updatePageParams({ modalityFilter: [...modalityFilter, modality] })
      }
      selected={modalityFilter}
      getOptionLabel={getModalityLabel}
      getOptionDescription={getLanguageModalityDescription}
      display={display}
    />
  );
};

export default LanguageModalitySelector;
