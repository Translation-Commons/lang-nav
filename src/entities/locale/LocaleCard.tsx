import React from 'react';

import Field from '@features/transforms/fields/Field';

import { LocaleData } from '@entities/locale/LocaleTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LocaleCensusCitation from './LocaleCensusCitation';
import LocalePopulationAdjusted from './LocalePopulationAdjusted';
import { getOfficialLabel } from './LocaleStrings';
import LocaleIndigeneityDisplay, {
  getIndigeneityDescription,
} from './localstatus/LocaleIndigeneityDisplay';

interface Props {
  locale: LocaleData;
}
const LocaleCard: React.FC<Props> = ({ locale }) => {
  const { populationAdjusted, officialStatus, populationSpeakingPercent, territory } = locale;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={locale} />
        <ObjectSubtitle object={locale} />
      </div>

      {populationAdjusted != null && (
        <CardField
          title="Population"
          field={Field.Population}
          description="How many people in this territory that use this language. Adjusted to 2025 population and including citation."
        >
          <LocalePopulationAdjusted locale={locale} />
        </CardField>
      )}
      {populationAdjusted != null && (
        <CardField
          title="Source"
          field={Field.Source}
          description="The source of the population data."
        >
          <LocaleCensusCitation locale={locale} size="short" />
        </CardField>
      )}

      {populationSpeakingPercent != null && (
        <CardField
          title="Percent population"
          field={Field.PercentOfTerritoryPopulation}
          description="Percent of the Territory population that use this locale."
        >
          <DecimalNumber num={populationSpeakingPercent} alignFraction={false} />% of{' '}
          {getTerritoryScopeLabel(territory?.scope).toLowerCase()}
        </CardField>
      )}

      <CardField
        title="Government Status"
        field={Field.GovernmentStatus}
        description="Whether the locale has official recognition."
      >
        {officialStatus != null ? (
          getOfficialLabel(officialStatus)
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Indigeneity"
        field={Field.Indigeneity}
        description={getIndigeneityDescription()}
      >
        <LocaleIndigeneityDisplay loc={locale} />
      </CardField>
    </div>
  );
};

export default LocaleCard;
