import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LanguageData } from '../LanguageTypes';

const LanguagePopulationFromEthnologue: React.FC<{ lang: LanguageData }> = ({
  lang: { Ethnologue },
}) => {
  if (Ethnologue.population == null) return null;
  if (Ethnologue.population === 0)
    return (
      <Hoverable hoverContent="Ethnologue expects that this language is extinct.">
        {(0).toLocaleString()}
      </Hoverable>
    );

  return (
    <Hoverable hoverContent="Lower bound estimate from Ethnologue, data from 2025.">
      ≥{Ethnologue.population.toLocaleString()}
    </Hoverable>
  );
};

export default LanguagePopulationFromEthnologue;
