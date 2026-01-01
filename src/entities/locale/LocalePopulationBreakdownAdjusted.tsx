import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { LocaleData } from '@entities/types/DataTypes';

import CellLabel from '@shared/containers/CellLabel';
import CellPopulation from '@shared/containers/CellPopulation';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

const LocalePopulationBreakdownAdjusted: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const {
    populationAdjusted,
    populationCensus,
    populationSpeaking,
    populationSpeakingPercent,
    territory,
  } = locale;
  if (!populationSpeaking || !populationAdjusted || !territory || !populationSpeakingPercent)
    return null;

  let yearCollected: React.ReactNode = populationCensus?.yearCollected;
  if (!yearCollected || populationCensus?.collectorType === CensusCollectorType.CLDR) {
    yearCollected = <Deemphasized>date unknown </Deemphasized>;
  }

  return (
    <table>
      <tbody>
        <tr>
          <CellLabel>Language Population Recorded({yearCollected}): </CellLabel>
          <CellPopulation population={populationSpeaking} />
        </tr>
        <tr>
          <CellLabel>% of Territory: </CellLabel>
          <td className="decimal"> {numberToFixedUnlessSmall(populationSpeakingPercent)} </td>
        </tr>
        <tr>
          <CellLabel>Source: </CellLabel>
          <td>
            {populationCensus ? (
              <HoverableObjectName object={populationCensus} />
            ) : (
              <Deemphasized>No citation </Deemphasized>
            )}
          </td>
        </tr>
        <tr>
          <CellLabel>Territory Population(when data collected): </CellLabel>
          <CellPopulation population={(populationSpeaking! / populationSpeakingPercent!) * 100} />
        </tr>
        <tr>
          <CellLabel>Territory Population(2025): </CellLabel>
          <CellPopulation population={territory.population} />
        </tr>
        <tr>
          <td colSpan={2}>
            Assuming linear population growth, <CountOfPeople count={territory!.population} /> *{' '}
            {numberToFixedUnlessSmall(populationSpeakingPercent!)}% =
          </td>
        </tr>
        <tr>
          <CellLabel>Population Adjusted to 2025: </CellLabel>
          <CellPopulation population={populationAdjusted} />
        </tr>
      </tbody>
    </table>
  );
};

export default LocalePopulationBreakdownAdjusted;
