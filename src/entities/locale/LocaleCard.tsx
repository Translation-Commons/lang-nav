import CardField from '@shared/containers/CardField';
import Deemphasized from '@shared/ui/Deemphasized';
import { ActivityIcon, UsersIcon } from 'lucide-react';

import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { LocaleData } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import DecimalNumber from '@shared/ui/DecimalNumber';

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
      <CardField
        title="Population"
        icon={UsersIcon}
        description="Population: How many people live in this locale (with citation)."
      >
        {populationAdjusted != null ? (
          <div>
            <LocalePopulationAdjusted locale={locale} />
            {' ['}
            <LocaleCensusCitation locale={locale} size="short" />
            {' ]'}
            {populationSpeakingPercent != null && (
              <div>
                <DecimalNumber num={populationSpeakingPercent} alignFraction={false} />% of{' '}
                {territory?.scope ?? 'territory'}
              </div>
            )}
          </div>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>
      <CardField
        title="Government status"
        icon={ActivityIcon}
        description="Government status: Whether the locale has official recognition."
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
