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
        className="ml-2 p-1 font-normal"
        onClick={() => setShowPopulationBreakdown(!showPopulationBreakdown)}
      >
        {showPopulationBreakdown ? 'hide' : 'show'} breakdown
      </HoverableButton>
      {showPopulationBreakdown && <div className="mt-0 mr-4 mb-4 ml-4">{breakdown}</div>}
    </>
  );
};

export default LanguagePopulationBreakdownButton;
