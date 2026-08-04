import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';

import { LanguageData } from '@entities/language/LanguageTypes';
import { LanguagePopulationEstimate } from '@entities/language/population/LanguagePopulationEstimate';
import PopulationFocus from '@entities/types/PopulationFocus';
import PopulationSourceCategoryDisplay from '@entities/ui/PopulationSourceCategoryDisplay';

import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

type Props = { lang: LanguageData; speakingOrWriting: 'speaking' | 'writing' };

const LanguagePopulationDetails: React.FC<Props> = ({ lang, speakingOrWriting }) => {
  const pop = lang.pop[speakingOrWriting];

  const title = (
    <>
      <span>{speakingOrWriting} Population</span>
      {pop.source && (
        <div style={{ fontSize: '0.75em', fontWeight: 'normal', textTransform: 'lowercase' }}>
          <PopulationSourceCategoryDisplay sourceCategory={pop.source} />
        </div>
      )}
    </>
  );

  return (
    <DetailsSection title={title}>
      {pop.estimate == null ? (
        <Deemphasized>No population data available.</Deemphasized>
      ) : (
        <div className="DetailsStatContainer">
          <DetailsStatBlock label={getLanguageModalityUserLabel(lang.modality, speakingOrWriting)}>
            <LanguagePopulationEstimate
              lang={lang}
              focus={
                speakingOrWriting === 'speaking'
                  ? PopulationFocus.Speaking
                  : PopulationFocus.Writing
              }
            />
          </DetailsStatBlock>
        </div>
      )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
