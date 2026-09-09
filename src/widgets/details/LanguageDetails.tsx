import React from 'react';

import LanguageDetailsDigitalSupport from '@entities/language/digitalsupport/LanguageDetailsDigitalSupport';
import LanguageDetailsIdentity from '@entities/language/identity/LanguageDetailsIdentity';
import LanguageDetailsAttributes from '@entities/language/LanguageDetailsAttributes';
import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageDetailsPopulation from '@entities/language/population/LanguageDetailsPopulation';
import LanguageDetailsConnections from '@entities/language/relations/LanguageDetailsConnections';
import LanguageDialectsSection from '@entities/language/relations/LanguageDetailsDialects';
import LanguageDetailsTerritories from '@entities/language/relations/LanguageDetailsTerritories';
import LanguageDetailsVitality from '@entities/language/vitality/LanguageDetailsVitality';

import './details.css';

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
