import React from 'react';

import CardEntityField from '@widgets/cardlists/CardEntityField';
import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import getFieldForPopulationFocus from '@features/transforms/fields/getFieldForPopulationFocus';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import type { LocaleData } from '@entities/locale/LocaleTypes';

import DecimalNumber from '@shared/ui/DecimalNumber';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LocaleCensusCitation from './LocaleCensusCitation';
import LocalePopulationAdjusted from './LocalePopulationAdjusted';

interface Props {
  locale?: LocaleData;
}
const LocaleCard: React.FC<Props> = ({ locale }) => {
  const { populationFocus } = usePageParams();
  const speakingOrWriting = locale
    ? getSpeakingOrWritingFocus(locale, populationFocus)
    : 'speaking';
  const pop = locale?.pop[speakingOrWriting];
  const popField = getFieldForPopulationFocus(populationFocus);

  return (
    <>
      {/* Population */}
      {locale == null && <CardEntityField field={Field.Population} />}
      {locale == null && <CardEntityField field={Field.SourceForPopulation} />}
      {locale && pop?.adjusted != null && (
        <CardField field={popField}>
          <LocalePopulationAdjusted locale={locale} focus={populationFocus} />
        </CardField>
      )}
      {locale && pop?.adjusted != null && (
        <CardField field={Field.SourceForPopulation}>
          <LocaleCensusCitation locale={locale} size="short" focus={populationFocus} />
        </CardField>
      )}

      {locale == null && <CardEntityField field={Field.PercentOfTerritoryPopulation} />}
      {locale && pop?.percent != null && (
        <CardField field={Field.PercentOfTerritoryPopulation}>
          <DecimalNumber num={pop.percent} alignFraction={false} />% of{' '}
          {getTerritoryScopeLabel(locale.territory?.scope).toLowerCase()}
        </CardField>
      )}

      <CardEntityField field={Field.GovernmentStatus} ent={locale} />

      <CardEntityField field={Field.Indigeneity} ent={locale} />

      <CardExtraFields
        ent={locale}
        excludeFields={[
          Field.Name,
          Field.Code,
          Field.Population,
          popField,
          Field.GovernmentStatus,
          Field.Indigeneity,
          Field.HistoricPresence,
          Field.LanguageFormedHere,
          Field.SourceForPopulation,
          Field.PercentOfTerritoryPopulation,
        ]}
      />
    </>
  );
};

export default LocaleCard;
