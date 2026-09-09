import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';

import PopulationFocus from '@entities/types/PopulationFocus';

import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

import { LanguageData } from '../LanguageTypes';

import { LanguagePopulationEstimate } from './LanguagePopulationEstimate';

type Props = { lang: LanguageData; speakingOrWriting: 'speaking' | 'writing' };

const LanguagePopulationDetails: React.FC<Props> = ({ lang, speakingOrWriting }) => {
  const pop = lang.pop[speakingOrWriting];

  return (
    <DetailsSection title={`${speakingOrWriting} Population`} isCollapsible={false}>
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
