import React from 'react';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageDetailsVitalityAndViability from '@entities/language/vitality/LanguageDetailsVitalityAndViability';
import LanguageVitalitySection from '@entities/language/vitality/LanguageVitalitySection';

import LanguageAttributes from './sections/LanguageAttributes';
import LanguageCodes from './sections/LanguageCodes';
import LanguageConnections from './sections/LanguageConnections';
import LanguageLocation from './sections/LanguageLocation';
import LanguageNames from './sections/LanguageNames';
import LanguagePopulationDetails from './sections/LanguagePopulationDetails';
import LanguageSpeakersByTerritorySection from './sections/LanguageSpeakersByTerritorySection';
import LanguageWikipediaSection from './sections/LanguageWikipediaSection';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <LanguageNames lang={lang} />
      <LanguageCodes lang={lang} />

      <FlexRow>
        <FlexItem>
          <LanguagePopulationDetails lang={lang} />
        </FlexItem>
        <FlexItem>
          <LanguageWikipediaSection lang={lang} />
        </FlexItem>
        <FlexItem>
          <LanguageVitalitySection lang={lang} />
        </FlexItem>
      </FlexRow>

      <FlexRow>
        <FlexItem flex="2 1 300px">
          <LanguageSpeakersByTerritorySection lang={lang} />
        </FlexItem>
        <FlexItem>
          <LanguageDetailsVitalityAndViability lang={lang} />
        </FlexItem>
      </FlexRow>

      <LanguageAttributes lang={lang} />
      <LanguageConnections lang={lang} />
      <LanguageLocation lang={lang} />
    </div>
  );
};

export default LanguageDetails;

const FlexRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-4 flex flex-wrap items-stretch gap-4">{children}</div>
);

const FlexItem: React.FC<{ children: React.ReactNode; flex?: string }> = ({
  children,
  flex = '1 1 200px',
}) => <div style={{ flex }}>{children}</div>;
