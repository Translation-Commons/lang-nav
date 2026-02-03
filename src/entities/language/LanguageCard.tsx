import {
  ActivityIcon,
  MapPinIcon,
  MapPinnedIcon,
  MessageCircleIcon,
  UsersIcon,
} from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import { uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import { getModalityLabel } from './LanguageModalityDisplay';
import { LanguagePopulationEstimate } from './LanguagePopulationEstimate';
import LanguageVitalityMeter from './vitality/VitalityMeter';
import { VitalitySource } from './vitality/VitalityTypes';

interface Props {
  lang: LanguageData;
}

const LanguageCard: React.FC<Props> = ({ lang }) => {
  const { updatePageParams, view } = usePageParams();
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
          <ObjectTitle object={lang} />
        </a>
        <ObjectSubtitle object={lang} />
      </h3>

      {populationEstimate != null && (
        <CardField
          title="Population"
          icon={UsersIcon}
          description="Population: How many people know the language across the world."
        >
          <LanguagePopulationEstimate lang={lang} />
        </CardField>
      )}

      <CardField
        title="Vitality"
        icon={ActivityIcon}
        description="An estimate of how active the language is in national and community spaces."
      >
        <LanguageVitalityMeter lang={lang} src={VitalitySource.Metascore} />
      </CardField>

      {modality != null && (
        <CardField
          title="Modality"
          icon={MessageCircleIcon}
          description="The ways in which people use the language."
        >
          {getModalityLabel(modality)}
        </CardField>
      )}

      {countryLocales.length > 0 && (
        <CardField
          title="Territories"
          icon={MapPinnedIcon}
          description="Locations that the language can be found in, sorted by population."
        >
          <CommaSeparated>
            {countryLocales.map((locale) => (
              <HoverableObjectName key={locale.ID} labelSource="territory" object={locale} />
            ))}
          </CommaSeparated>
        </CardField>
      )}

      {view === View.Map && lang.longitude != null && lang.latitude != null && (
        <CardField
          title="Coordinates"
          icon={MapPinIcon}
          description="The latitude and longitude for the modern and/or historic center of the language."
        >
          {lang.latitude.toFixed(2)}°, {lang.longitude.toFixed(2)}°
        </CardField>
      )}
    </div>
  );
};

export default LanguageCard;
