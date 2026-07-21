import React from 'react';

import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import CardTitleBlock from '@entities/ui/CardTitleBlock';

import CardField from '@shared/containers/CardField';
import { uniqueBy } from '@shared/lib/setUtils';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import LanguageTerritoryList from './LanguageTerritoryList';
import { LanguagePopulationEstimate } from './population/LanguagePopulationEstimate';
import LanguageVitalityMeter from './vitality/VitalityMeter';
import { VitalitySource } from './vitality/VitalityTypes';

interface Props {
  lang: LanguageData;
}

const LanguageCard: React.FC<Props> = ({ lang }) => {
  const { view } = usePageParams();
  const sortFunction = getSortFunction();
  const { locales, populationEstimate } = lang;
  const countryLocales = uniqueBy(
    locales.filter((l) => l.territory?.scope === TerritoryScope.Country).sort(sortFunction),
    (l) => l.territoryCode ?? '',
  );

  return (
    <div>
      <CardTitleBlock object={lang} showEndonym />

      <CardField
        title="Language Type"
        field={Field.LanguageScope}
        description="Whether this is a Language Family, Macrolanguage, Individual Language, or Dialect."
      >
        {getLanguageScopeLabel(lang.scope)}
      </CardField>

      {populationEstimate != null && (
        <CardField
          title="Population"
          field={Field.Population}
          description="How many people know the language across the world."
        >
          <LanguagePopulationEstimate lang={lang} />
        </CardField>
      )}

      <CardField
        title="Vitality"
        field={Field.VitalityMetascore}
        description="An estimate of how active the language is in national and community spaces."
      >
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Metascore} />
      </CardField>

      {countryLocales.length > 0 && (
        <CardField
          title="Territories"
          field={Field.Territory}
          description="Locations that the language can be found in, sorted by population."
        >
          <LanguageTerritoryList lang={lang} />
        </CardField>
      )}

      {view === View.Map && lang.longitude != null && lang.latitude != null && (
        <CardField
          title="Coordinates"
          field={Field.Coordinates}
          description="The latitude and longitude for the modern and/or historic center of the language."
        >
          {lang.latitude.toFixed(2)}°, {lang.longitude.toFixed(2)}°
        </CardField>
      )}
    </div>
  );
};

export default LanguageCard;
