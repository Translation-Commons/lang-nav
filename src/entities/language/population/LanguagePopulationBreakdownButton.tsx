import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';

import { PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import { LanguageData } from '../LanguageTypes';

import { LanguagePopulationBreakdownFromDescendants } from './LanguagePopulationFromDescendants';
import { LanguagePopulationBreakdownFromLocales } from './LanguagePopulationFromLocales';

const LanguagePopulationBreakdownButton: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const { populationEstimate, populationEstimateSource } = lang;
  const [showPopulationBreakdown, setShowPopulationBreakdown] = React.useState(false);

  if (!populationEstimate || !populationEstimateSource) return null;

  let breakdown = null;
  if (populationEstimateSource === PopulationSourceCategory.AggregatedFromTerritories) {
    breakdown = <LanguagePopulationBreakdownFromLocales lang={lang} />;
  } else if (populationEstimateSource === PopulationSourceCategory.AggregatedFromLanguages) {
    breakdown = <LanguagePopulationBreakdownFromDescendants lang={lang} />;
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
