import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import { LocaleData } from '@entities/locale/LocaleTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import CountOfPeople from '@shared/ui/CountOfPeople';

import LocalePopulationBreakdown from './LocalePopulationBreakdown';

type Props = {
  locale: LocaleData;
  focus: PopulationFocus;
};

const LocalePopulationAdjusted: React.FC<Props> = ({ locale, focus }) => {
  const speakingOrWriting = getSpeakingOrWritingFocus(locale, focus);
  const pop = locale.pop[speakingOrWriting];
  if (pop.adjusted == null) return null;

  return (
    <Hoverable
      hoverContent={
        <LocalePopulationBreakdown locale={locale} speakingOrWriting={speakingOrWriting} />
      }
    >
      <CountOfPeople count={pop.adjusted} />
    </Hoverable>
  );
};

export default LocalePopulationAdjusted;
