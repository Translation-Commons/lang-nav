import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import { LanguageData } from '../LanguageTypes';

import { LanguagePopulationBreakdownFromDescendants } from './LanguagePopulationFromDescendants';
import { LanguagePopulationBreakdownFromLocales } from './LanguagePopulationFromLocales';

type Props = {
  lang: LanguageData;
  speakingOrWriting?: 'speaking' | 'writing';
};

const LanguagePopulationBreakdownButton: React.FC<Props> = ({ lang, speakingOrWriting }) => {
  speakingOrWriting = speakingOrWriting ?? getSpeakingOrWritingFocus(lang);
  const pop = lang.pop[speakingOrWriting];
  const [showPopulationBreakdown, setShowPopulationBreakdown] = React.useState(false);

  if (!pop.estimate || !pop.source) return null;

  let breakdown = null;
  if (pop.source === PopulationSourceCategory.AggregatedFromTerritories) {
    breakdown = (
      <LanguagePopulationBreakdownFromLocales lang={lang} speakingOrWriting={speakingOrWriting} />
    );
  } else if (pop.source === PopulationSourceCategory.AggregatedFromLanguages) {
    breakdown = (
      <LanguagePopulationBreakdownFromDescendants
        lang={lang}
        speakingOrWriting={speakingOrWriting}
      />
    );
  }
  if (!breakdown) return null;

  return (
    <>
      <HoverableButton
        style={{ marginLeft: '0.5em', padding: '0.25em', fontWeight: 'normal' }}
        onClick={() => setShowPopulationBreakdown(!showPopulationBreakdown)}
      >
        {showPopulationBreakdown ? 'hide' : 'show'} breakdown
      </HoverableButton>
      {showPopulationBreakdown && <div style={{ margin: '0em 1em 1em 1em' }}>{breakdown}</div>}
    </>
  );
};

export default LanguagePopulationBreakdownButton;
