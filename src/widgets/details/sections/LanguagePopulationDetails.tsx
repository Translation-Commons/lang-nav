import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LanguagePopulationEstimate } from '@entities/language/population/LanguagePopulationEstimate';
import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

type Props = { lang: LanguageData };

const LanguagePopulationDetails: React.FC<Props> = ({ lang }) => {
  const { populationEstimate, populationEstimateSource } = lang;

  const title = (
    <>
      Population
      {populationEstimateSource && (
        <div style={{ fontSize: '0.75em', fontWeight: 'normal', textTransform: 'lowercase' }}>
          <PopulationSourceCategoryDisplay sourceCategory={populationEstimateSource} />
        </div>
      )}
    </>
  );

  return (
    <DetailsSection title={title}>
      {populationEstimate == null ? (
        <Deemphasized>No population data available.</Deemphasized>
      ) : (
        <div className="DetailsStatContainer">
          <DetailsStatBlock label={getLanguageModalityUserLabel(lang.modality)}>
            <LanguagePopulationEstimate lang={lang} />
          </DetailsStatBlock>
        </div>
      )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
