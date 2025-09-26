import React from 'react';

import { usePageParams } from '../../controls/PageParamsContext';
import { getSortFunction } from '../../controls/sort';
import CommaSeparated from '../../generic/CommaSeparated';
import { uniqueBy } from '../../generic/setUtils';
import { TerritoryScope } from '../../types/DataTypes';
import { LanguageData } from '../../types/LanguageTypes';
import HoverableObjectName from '../common/HoverableObjectName';
import ObjectTitle from '../common/ObjectTitle';
import PopulationWarning from '../common/PopulationWarning';

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
    (l) => l.territoryCode,
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
        <LanguageVitalityMeter lang={lang} />
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
