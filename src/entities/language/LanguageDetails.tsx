import React from 'react';

import DetailsBox from '@widgets/details/ui/DetailsBox';
import DetailsRow from '@widgets/details/ui/DetailsRow';

import LanguageDetailsDigitalSupport from './digitalsupport/LanguageDetailsDigitalSupport';
import LanguageDetailsIdentity from './identity/LanguageDetailsIdentity';
import LanguageDetailsAttributes from './LanguageDetailsAttributes';
import { LanguageData } from './LanguageTypes';
import LanguageDetailsPopulation from './population/LanguageDetailsPopulation';
import LanguageDetailsConnections from './relations/LanguageDetailsConnections';
import LanguageDialectsSection from './relations/LanguageDetailsDialects';
import LanguageDetailsTerritories from './relations/LanguageDetailsTerritories';
import LanguageDetailsVitality from './vitality/LanguageDetailsVitality';

type Props = {
  lang: LanguageData;
};

const LanguageDetails: React.FC<Props> = ({ lang }) => {
  return (
    <div className="Details">
      <DetailsRow>
        <DetailsBox>
          <LanguageDetailsPopulation lang={lang} speakingOrWriting="speaking" />
        </DetailsBox>
        <DetailsBox>
          <LanguageDetailsPopulation lang={lang} speakingOrWriting="writing" />
        </DetailsBox>
        {/* <DetailsBox>
          <LanguageWikipediaSection lang={lang} />
        </DetailsBox> */}
        <DetailsBox>
          <LanguageDetailsVitality lang={lang} />
        </DetailsBox>
      </DetailsRow>

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
