import React from 'react';

import usePageParams from '@features/params/usePageParams';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import getFieldForPopulationFocus from '@features/transforms/fields/getFieldForPopulationFocus';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import { LocaleData } from '@entities/locale/LocaleTypes';
import EntitySubtitle from '@entities/ui/EntitySubtitle';
import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LocaleCensusCitation from './LocaleCensusCitation';
import LocalePopulationAdjusted from './LocalePopulationAdjusted';
import { getOfficialLabel } from './LocaleStrings';
import LocaleIndigeneityDisplay from './localstatus/LocaleIndigeneityDisplay';

interface Props {
  locale: LocaleData;
}
const LocaleCard: React.FC<Props> = ({ locale }) => {
  const { officialStatus, territory } = locale;
  const { populationFocus } = usePageParams();
  const speakingOrWriting = getSpeakingOrWritingFocus(locale, populationFocus);
  const pop = locale.pop[speakingOrWriting];
  const popField = getFieldForPopulationFocus(populationFocus);

  const extraFields = useActiveTransforms([
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
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={locale} />
        <EntitySubtitle ent={locale} />
      </div>

      {pop.adjusted != null && (
        <CardField field={popField}>
          <LocalePopulationAdjusted locale={locale} focus={populationFocus} />
        </CardField>
      )}
      {pop.adjusted != null && (
        <CardField field={Field.SourceForPopulation}>
          <LocaleCensusCitation locale={locale} size="short" focus={populationFocus} />
        </CardField>
      )}

      {pop.percent != null && (
        <CardField field={Field.PercentOfTerritoryPopulation}>
          <DecimalNumber num={pop.percent} alignFraction={false} />% of{' '}
          {getTerritoryScopeLabel(territory?.scope).toLowerCase()}
        </CardField>
      )}

      <CardField field={Field.GovernmentStatus}>
        {officialStatus != null ? (
          getOfficialLabel(officialStatus)
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField field={Field.Indigeneity}>
        <LocaleIndigeneityDisplay loc={locale} />
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={locale} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default LocaleCard;
