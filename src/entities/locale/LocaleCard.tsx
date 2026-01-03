import React from 'react';

import usePageParams from '@features/params/usePageParams';

import { LocaleData } from '@entities/types/DataTypes';
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
          <ObjectTitle object={locale} highlightSearchMatches={true} />
        </a>
      </h3>
      {populationAdjusted != null && (
        <div>
          <h4>Population</h4>
          <LocalePopulationAdjusted locale={locale} />
          {' ['}
          <LocaleCensusCitation locale={locale} size="short" />
          {']'}
          {populationSpeakingPercent != null && (
            <div>
              {<DecimalNumber num={populationSpeakingPercent} alignFraction={false} />}% of{' '}
              {territory?.scope ?? 'territory'}
            </div>
          )}
        </div>
      )}
      {officialStatus && (
        <div>
          <h4>Government status</h4>
          {getOfficialLabel(officialStatus)}
        </div>
      )}
    </div>
  );
};

export default LocaleCard;
