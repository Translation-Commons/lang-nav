import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LanguagePopulationEstimate } from '@entities/language/population/LanguagePopulationEstimate';
import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

import DetailsSection from '@shared/containers/DetailsSection';
import DetailsStatBlock from '@shared/containers/DetailsStatBlock';
import DetailsStatContainer from '@shared/containers/DetailsStatContainer';
import Deemphasized from '@shared/ui/old/Deemphasized';

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
        <DetailsStatContainer>
          <DetailsStatBlock label={getLanguageModalityUserLabel(lang.modality)}>
            <LanguagePopulationEstimate lang={lang} />
          </DetailsStatBlock>
        </DetailsStatContainer>
      )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
