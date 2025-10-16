import React from 'react';

import { usePageParams } from '@widgets/PageParamsProvider';
import PopulationWarning from '@widgets/PopulationWarning';

import { getSortFunction } from '@features/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/types/DataTypes';
import HoverableObjectName from '@entities/ui/HoverableObjectName';
import ObjectTitle from '@entities/ui/ObjectTitle';

import { uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { VitalityMeterType } from './LanguageVitalityComputation';
import LanguageVitalityMeter from './LanguageVitalityMeter';

interface Props {
  lang: LanguageData;
  includeRelations?: boolean;
}

const LanguageCard: React.FC<Props> = ({ lang, includeRelations }) => {
  const { updatePageParams } = usePageParams();
  const sortFunction = getSortFunction();
  const { ID, locales, modality, populationEstimate } = lang;
  const countryLocales = uniqueBy(
    locales.filter((l) => l.territory?.scope === TerritoryScope.Country).sort(sortFunction),
    (l) => l.territoryCode ?? '',
  );

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={lang} highlightSearchMatches={true} />
        </a>
      </h3>
      {populationEstimate != null && (
        <div>
          <h4>
            Population <PopulationWarning />
          </h4>
          {populationEstimate.toLocaleString()}
        </div>
      )}
      {modality != null && (
        <div>
          <h4>Modality</h4>
          {modality}
        </div>
      )}
      <div>
        <h4>Vitality</h4>
        <LanguageVitalityMeter lang={lang} type={VitalityMeterType.Metascore} />
      </div>

      {includeRelations && countryLocales.length > 0 && (
        <div>
          <h4>Countries:</h4>
          <CommaSeparated>
            {countryLocales.map((locale) => (
              <HoverableObjectName key={locale.ID} labelSource="territory" object={locale} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </div>
  );
};

export default LanguageCard;
