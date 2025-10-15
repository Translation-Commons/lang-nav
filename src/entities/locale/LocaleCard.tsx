import { LocaleData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';
import { usePageParams } from '@widgets/PageParamsProvider';
import React from 'react';

import { numberToFixedUnlessSmall } from '../../shared/lib/numberUtils';

import LocaleCensusCitation from './LocaleCensusCitation';
import { getOfficialLabel } from './LocaleStrings';

interface Props {
  locale: LocaleData;
}
const LocaleCard: React.FC<Props> = ({ locale }) => {
  const { ID, populationSpeaking, officialStatus, populationSpeakingPercent, territory } = locale;
  const { updatePageParams } = usePageParams();

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={locale} highlightSearchMatches={true} />
        </a>
      </h3>
      {populationSpeaking != null && (
        <div>
          <h4>Speakers</h4>
          {populationSpeaking.toLocaleString()}
          {' ['}
          <LocaleCensusCitation locale={locale} size="short" />
          {']'}
          {populationSpeakingPercent != null && (
            <div>
              {numberToFixedUnlessSmall(populationSpeakingPercent)}% of{' '}
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
