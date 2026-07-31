import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import { LanguageData } from '../LanguageTypes';

import { LanguagePopulationBreakdownFromDescendants } from './LanguagePopulationFromDescendants';
import { LanguagePopulationBreakdownFromLocales } from './LanguagePopulationFromLocales';

type Props = {
  lang: LanguageData;
  use?: 'speaking' | 'writing';
};

const LanguagePopulationBreakdownButton: React.FC<Props> = ({ lang, use }) => {
  use = use ?? (lang.pop.overall === lang.pop.writing.estimate ? 'writing' : 'speaking');
  const pop = lang.pop[use];
  const [showPopulationBreakdown, setShowPopulationBreakdown] = React.useState(false);

  if (!pop.estimate || !pop.source) return null;

  let breakdown = null;
  if (pop.source === PopulationSourceCategory.AggregatedFromTerritories) {
    breakdown = <LanguagePopulationBreakdownFromLocales lang={lang} use={use} />;
  } else if (pop.source === PopulationSourceCategory.AggregatedFromLanguages) {
    breakdown = <LanguagePopulationBreakdownFromDescendants lang={lang} use={use} />;
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
