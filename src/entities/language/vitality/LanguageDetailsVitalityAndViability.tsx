import React from 'react';

import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import LinkButton from '@shared/ui/LinkButton';
import Pill from '@shared/ui/Pill';

import { ObjectCLDRCoverageLevel, ObjectCLDRLocaleCount } from '../../ui/CLDRCoverageInfo';
import ObjectWikipediaInfo from '../../ui/ObjectWikipediaInfo';
import LanguageDigitalSupportCell from '../LanguageDigitalSupportCell';
import { LanguageData } from '../LanguageTypes';

import LanguageVitalityMeter from './VitalityMeter';
import { VitalitySource } from './VitalityTypes';

const LanguageDetailsVitalityAndViability: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { viabilityConfidence, viabilityExplanation, vitality = {}, Ethnologue } = lang;

  return (
    <DetailsSection title="Vitality & Viability">
      <DetailsField title="Vitality Metascore">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Metascore} />
      </DetailsField>

      <DetailsField title="ISO Status">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.ISO} />{' '}
        {vitality.iso != null &&
          (lang.ISO.status != null ? <Pill>ISO</Pill> : <Pill>Derived</Pill>)}
      </DetailsField>

      <DetailsField title="Ethnologue (2012)">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Eth2012} />{' '}
        {vitality.ethFine != null &&
          (Ethnologue.vitality2012 != null ? <Pill>Ethnologue 2012</Pill> : <Pill>Derived</Pill>)}
      </DetailsField>

      <DetailsField title="Ethnologue (2025)">
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Eth2025} />{' '}
        {vitality.ethCoarse != null &&
          (Ethnologue.vitality2025 != null ? <Pill>Ethnologue 2025</Pill> : <Pill>Derived</Pill>)}
      </DetailsField>
      <DetailsField title="Should use in World Atlas">
        {viabilityConfidence} ... {viabilityExplanation}
      </DetailsField>
      <DetailsField
        title="Digital Support (Ethnologue)"
        endContent={
          <LinkButton href="https://www.ethnologue.com/insights/digital-language-divide/">
            Ethnologue
          </LinkButton>
        }
      >
        <LanguageDigitalSupportCell lang={lang} />
      </DetailsField>
      <DetailsField title="CLDR Coverage">
        <div style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.5em' }}>
          <CLDRWarningNotes object={lang} />
          <ObjectCLDRCoverageLevel object={lang} />
          <ObjectCLDRLocaleCount object={lang} verbose={true} />
        </div>
      </DetailsField>
      <DetailsField title="ICU Support">
        <ICUSupportStatus object={lang} />
      </DetailsField>
      <DetailsField
        title="Wikipedia"
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
