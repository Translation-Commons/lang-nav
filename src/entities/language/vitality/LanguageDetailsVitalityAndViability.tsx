import React from 'react';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import LinkButton from '@shared/ui/LinkButton';

import { CLDRCoverageText, ICUSupportStatus } from '../../ui/CLDRCoverageInfo';
import ObjectWikipediaInfo from '../../ui/ObjectWikipediaInfo';
import { LanguageData } from '../LanguageTypes';

import LanguageVitalityMeter from './VitalityMeter';
import { VitalitySource } from './VitalityTypes';

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { viabilityConfidence, viabilityExplanation, digitalSupport } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      <DetailsField title="Vitality Metascore:">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.Metascore} />
      </DetailsField>

      <DetailsField title="ISO Vitality / Status:">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.ISO} />
      </DetailsField>

      <DetailsField title="Ethnologue (2013):">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.Eth2013} />
      </DetailsField>

      <DetailsField title="Ethnologue (2025):">
        <LanguageVitalityMeter lang={lang} type={VitalitySource.Eth2025} />
      </DetailsField>
      <DetailsField title="Should use in World Atlas:">
        {viabilityConfidence} ... {viabilityExplanation}
      </DetailsField>
      <DetailsField
        title="Digital Support (Ethnologue):"
        endContent={
          <LinkButton href="https://www.ethnologue.com/insights/digital-language-divide/">
            Ethnologue
          </LinkButton>
        }
      >
        {digitalSupport}
      </DetailsField>
      <DetailsField title="CLDR Coverage:">
        <CLDRCoverageText object={lang} />
      </DetailsField>
      <DetailsField title="ICU Support:">
        <ICUSupportStatus object={lang} />
      </DetailsField>
      <DetailsField
        title="Wikipedia:"
        endContent={
          lang.wikipedia && <LinkButton href={lang.wikipedia.url}>{lang.wikipedia.url}</LinkButton>
        }
      >
        <ObjectWikipediaInfo object={lang} />
      </DetailsField>
    </DetailsSection>
  );
};

export default LanguageDetailsVitalityAndViability;
