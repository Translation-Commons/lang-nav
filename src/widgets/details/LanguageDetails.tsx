import React from 'react';

import LanguageDetailsDigitalSupport from '@entities/language/digitalsupport/LanguageDetailsDigitalSupport';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageDetailsVitalityAndViability from '@entities/language/vitality/LanguageDetailsVitalityAndViability';

import './details.css';
import LanguageAttributes from './sections/LanguageAttributes';
import LanguageConnections from './sections/LanguageConnections';
import LanguageIdentity from './sections/LanguageIdentity';
import LanguageLocales from './sections/LanguageLocales';
import LanguageLocation from './sections/LanguageLocation';
import LanguagePopulationDetails from './sections/LanguagePopulationDetails';
import LanguageSpeakersByTerritorySection from './sections/LanguageSpeakersByTerritorySection';
import LanguageTerritoriesSection from './sections/LanguageTerritoriesSection';
import LanguageWikipediaSection from './sections/LanguageWikipediaSection';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <div className="DetailsRow">
        <div className="DetailsBox">
          <LanguagePopulationDetails lang={lang} speakingOrWriting="speaking" />
        </div>
        <div className="DetailsBox">
          <LanguagePopulationDetails lang={lang} speakingOrWriting="writing" />
        </div>
        <div className="DetailsBox">
          <LanguageWikipediaSection lang={lang} />
        </div>
        {/* <div className="DetailsBox">
          <LanguageVitalitySection lang={lang} />
        </div> */}
      </div>

      <LanguageIdentity lang={lang} />

      <div className="DetailsRow">
        <div className="DetailsBox" style={{ flex: '2 1 300px' }}>
          <LanguageSpeakersByTerritorySection lang={lang} />
        </div>
        <div className="DetailsBox">
          <LanguageDetailsVitalityAndViability lang={lang} />
        </div>
      </div>

      <LanguageLocales lang={lang} />
      <LanguageDetailsDigitalSupport lang={lang} />
      <LanguageAttributes lang={lang} />
      <LanguageConnections lang={lang} />
      <LanguageLocation lang={lang} />
      <LanguageTerritoriesSection lang={lang} />
    </div>
  );
};

export default LanguageDetails;
