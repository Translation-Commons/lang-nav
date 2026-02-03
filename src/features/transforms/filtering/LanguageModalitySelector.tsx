import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { LanguageModality } from '@entities/language/LanguageModality';
import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';

const MODALITY_OPTIONS_ORDERED: LanguageModality[] = [
  LanguageModality.Written,
  LanguageModality.MostlyWritten,
  LanguageModality.SpokenAndWritten,
  LanguageModality.MostlySpoken,
  LanguageModality.Spoken,
  LanguageModality.Sign,
];

const LanguageModalitySelector: React.FC = () => {
  const { modalityFilter, updatePageParams } = usePageParams();

  function getOptionLabel(modality: LanguageModality): string {
    return getModalityLabel(modality) ?? String(modality);
  }

  const selectorDescription =
    'Filter by how the language is primarily used: written, spoken, sign, or a combination.';

  return (
    <Selector
      selectorLabel="Modality"
      labelWhenEmpty="Any"
      selectorDescription={selectorDescription}
      options={MODALITY_OPTIONS_ORDERED}
      onChange={(modality: LanguageModality) =>
        modalityFilter.includes(modality)
          ? updatePageParams({
              modalityFilter: modalityFilter.filter((m) => m !== modality),
            })
          : updatePageParams({ modalityFilter: [...modalityFilter, modality] })
      }
      selected={modalityFilter}
      getOptionLabel={getOptionLabel}
    />
  );
};

export default LanguageModalitySelector;
