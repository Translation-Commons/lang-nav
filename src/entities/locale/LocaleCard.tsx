import { BracketsIcon, LandmarkIcon, MapPinHouseIcon, PercentIcon, UsersIcon } from 'lucide-react';
import React from 'react';

import { LocaleData } from '@entities/locale/LocaleTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LocaleCensusCitation from './LocaleCensusCitation';
import LocaleIndigeneityDisplay, { getIndigeneityDescription } from './LocaleIndigeneityDisplay';
import LocalePopulationAdjusted from './LocalePopulationAdjusted';
import { getOfficialLabel } from './LocaleStrings';

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
          icon={UsersIcon}
          description="How many people in this territory that use this language. Adjusted to 2025 population and including citation."
        >
          <LocalePopulationAdjusted locale={locale} />
        </CardField>
      )}
      {populationAdjusted != null && (
        <CardField
          title="Source"
          icon={BracketsIcon}
          description="The source of the population data."
        >
          <LocaleCensusCitation locale={locale} size="short" />
        </CardField>
      )}

      {populationSpeakingPercent != null && (
        <CardField
          title="Percent population"
          icon={PercentIcon}
          description="Percent of the Territory population that use this locale."
        >
          <DecimalNumber num={populationSpeakingPercent} alignFraction={false} />% of{' '}
          {getTerritoryScopeLabel(territory?.scope).toLowerCase()}
        </CardField>
      )}

      <CardField
        title="Government Status"
        icon={LandmarkIcon}
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
        icon={MapPinHouseIcon}
        description={getIndigeneityDescription()}
      >
        <LocaleIndigeneityDisplay loc={locale} />
      </CardField>
    </div>
  );
};

export default LocaleCard;
