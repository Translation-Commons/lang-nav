import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguagePopulationBreakdownButton from '@entities/language/population/LanguagePopulationBreakdownButton';
import { LanguagePopulationEstimate } from '@entities/language/population/LanguagePopulationEstimate';
import LanguagePopulationOfDescendants from '@entities/language/population/LanguagePopulationFromDescendants';
import LanguagePopulationFromEthnologue from '@entities/language/population/LanguagePopulationFromEthnologue';
import LanguagePopulationFromLocales from '@entities/language/population/LanguagePopulationFromLocales';
import { PopulationSourceCategory } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';

type Props = { lang: LanguageData };

const LanguagePopulationDetails: React.FC<Props> = ({ lang }) => {
  const {
    populationEstimate,
    populationEstimateSource,
    populationFromLocales,
    populationOfDescendants,
    Ethnologue,
  } = lang;

  return (
    <DetailsSection title="Population">
      {populationEstimate != null && (
        <DetailsField title="Best Estimate">
          <LanguagePopulationEstimate lang={lang} />
          <LanguagePopulationBreakdownButton lang={lang} />
        </DetailsField>
      )}
      {populationEstimateSource && (
        <DetailsField title="Source" indent={1}>
          {populationEstimateSource}
        </DetailsField>
      )}
      {!populationEstimateSource && (
        <>This language does not have any available population estimate.</>
      )}
      {populationOfDescendants &&
        populationOfDescendants > 10 &&
        populationEstimateSource !== PopulationSourceCategory.AggregatedFromLanguages && (
          <DetailsField title="... of Descendants">
            <LanguagePopulationOfDescendants lang={lang} />
          </DetailsField>
        )}
      {populationFromLocales &&
        populationEstimateSource !== PopulationSourceCategory.AggregatedFromTerritories && (
          <DetailsField title="... from Locales">
            <LanguagePopulationFromLocales lang={lang} />
          </DetailsField>
        )}
      {Ethnologue.population != null &&
        populationEstimateSource !== PopulationSourceCategory.Ethnologue && (
          <LanguagePopulationFromEthnologue lang={lang} />
        )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
