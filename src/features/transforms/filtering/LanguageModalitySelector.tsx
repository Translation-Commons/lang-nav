import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';

const LanguageModalitySelector: React.FC = () => {
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
    />
  );
};

export default LanguageModalitySelector;
