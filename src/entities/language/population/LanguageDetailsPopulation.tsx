import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';
import DetailsStatContainer from '@widgets/details/ui/DetailsStatContainer';

import PopulationFocus from '@entities/types/PopulationFocus';

import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

import type { LanguageData } from '../LanguageTypes';
import LanguageStandardRegisterNote from '../relations/LanguageStandardRegisterNote';

import { LanguagePopulationEstimate } from './LanguagePopulationEstimate';

type Props = { lang: LanguageData; speakingOrWriting: 'speaking' | 'writing' };

const LanguagePopulationDetails: React.FC<Props> = ({ lang, speakingOrWriting }) => {
  const pop = lang.pop[speakingOrWriting];

  return (
    <DetailsSection title={`${speakingOrWriting} Population`} isCollapsible={false}>
      {pop.estimate == null ? (
        <Deemphasized>No population data available.</Deemphasized>
      ) : (
        <DetailsStatContainer>
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
          {speakingOrWriting === 'writing' && (
            <LanguageStandardRegisterNote className="text-sm" lang={lang} />
          )}
        </DetailsStatContainer>
      )}
    </DetailsSection>
  );
};

export default LanguagePopulationDetails;
