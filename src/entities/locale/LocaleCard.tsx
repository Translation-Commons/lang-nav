import { LandmarkIcon, PercentIcon, UsersIcon } from 'lucide-react';
import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { LocaleData } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

import LocaleCensusCitation from './LocaleCensusCitation';
import LocalePopulationAdjusted from './LocalePopulationAdjusted';
import { getOfficialLabel } from './LocaleStrings';

interface Props {
  locale: LocaleData;
}
const LocaleCard: React.FC<Props> = ({ locale }) => {
  const { ID, populationAdjusted, officialStatus, populationSpeakingPercent, territory } = locale;
  const { updatePageParams } = usePageParams();

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={locale} />
        </a>
        <ObjectSubtitle object={locale} />
      </h3>

      {populationAdjusted != null && (
        <CardField
          title="Population"
          icon={UsersIcon}
          description="How many people live in this locale (with citation)."
        >
          <LocalePopulationAdjusted locale={locale} />
          {' ['}
          <LocaleCensusCitation locale={locale} size="short" />
          {' ]'}
        </CardField>
      )}

      {populationSpeakingPercent != null && (
        <CardField
          title="% speaking"
          icon={PercentIcon}
          description="Percent of the Territory population speaking this locale."
        >
          <DecimalNumber num={populationSpeakingPercent} alignFraction={false} />% of{' '}
          {territory?.scope ?? 'territory'}
        </CardField>
      )}

      <CardField
        title="Government status"
        icon={LandmarkIcon}
        description="Whether the locale has official recognition."
      >
        {officialStatus != null ? (
          getOfficialLabel(officialStatus)
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>
    </div>
  );
};

export default LocaleCard;
