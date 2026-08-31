import React from 'react';

import LanguageDetailsDigitalSupport from '@entities/language/digitalsupport/LanguageDetailsDigitalSupport';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageDetailsVitality from '@entities/language/vitality/LanguageDetailsVitality';
import './details.css';

import LanguageDetailsAttributes from './sections/LanguageDetailsAttributes';
import LanguageDetailsConnections from './sections/LanguageDetailsConnections';
import LanguageDialectsSection from './sections/LanguageDetailsDialects';
import LanguageDetailsIdentity from './sections/LanguageDetailsIdentity';
import LanguageDetailsPopulation from './sections/LanguageDetailsPopulation';
import LanguageDetailsTerritories from './sections/LanguageDetailsTerritories';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <div className="DetailsRow">
        <div className="grow shrink basis-[200px]">
          <LanguageDetailsPopulation lang={lang} speakingOrWriting="speaking" />
        </div>
        <div className="grow shrink basis-[200px]">
          <LanguageDetailsPopulation lang={lang} speakingOrWriting="writing" />
        </div>
        {/* <div className="grow shrink basis-[200px]">
          <LanguageWikipediaSection lang={lang} />
        </div> */}
        <div className="grow shrink basis-[200px]">
          <LanguageDetailsVitality lang={lang} />
        </div>
      </div>

      <LanguageDetailsIdentity lang={lang} />

      <LanguageDetailsDigitalSupport lang={lang} />
      <LanguageDialectsSection lang={lang} />
      <LanguageDetailsTerritories lang={lang} />
      <LanguageDetailsAttributes lang={lang} />
      <LanguageDetailsConnections lang={lang} />
    </div>
  );
};

export default LanguageDetails;
