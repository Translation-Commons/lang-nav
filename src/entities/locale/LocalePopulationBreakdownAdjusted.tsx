import React from 'react';

import TerritoryDataYear from '@features/data/context/TerritoryDataYear';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import CellLabel from '@shared/containers/CellLabel';
import CellPercent from '@shared/containers/CellPercent';
import CellPopulation from '@shared/containers/CellPopulation';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLocaleName } from './LocaleStrings';

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

  const localeNameWithoutTerritory = getLocaleName(locale, false);
  const territoryName = locale.territory?.nameDisplay || 'territory';
  const fromCLDR =
    populationCensus?.collectorType === CensusCollectorType.CLDR ||
    locale.populationSource === PopulationSourceCategory.CLDR;
  const isAdjusted = populationAdjusted !== populationSpeaking;

  return (
    <table>
      <tbody>
        <tr>
          <CellLabel>Quantity</CellLabel>
          <CellLabel>Year</CellLabel>
          <CellLabel align="right">Value</CellLabel>
        </tr>
        <tr>
          <td>{localeNameWithoutTerritory} population recorded</td>
          <td>
            {(!fromCLDR && populationCensus?.yearCollected) || <Deemphasized>unknown</Deemphasized>}
          </td>
          <CellPopulation population={populationSpeaking} />
        </tr>
        <tr>
          <td colSpan={2}>% of {territoryName}</td>
          <CellPercent percent={populationSpeakingPercent} showPercentSign alignFraction={false} />
        </tr>
        <tr>
          <td colSpan={2}>Source</td>
          <td>
            {populationCensus ? (
              <HoverableObjectName object={populationCensus} />
            ) : (
              <Deemphasized>No citation</Deemphasized>
            )}
          </td>
        </tr>
        {/* Show the population of the territory used to compute the percent if there is a different number from the source */}
        {(fromCLDR || populationCensus?.yearCollected) && (
          <tr>
            <td>{territoryName} population</td>
            <td>{fromCLDR ? 'in CLDR' : (populationCensus?.yearCollected ?? 'from source')}</td>
            <CellPopulation population={(populationSpeaking! / populationSpeakingPercent!) * 100} />
          </tr>
        )}
        {/* Always show the population of the territory in the latest territory data */}
        <tr>
          <td>{territoryName} population</td>
          <td>{TerritoryDataYear}</td>
          <CellPopulation population={territory.population} />
        </tr>
        {isAdjusted && (
          <>
            <tr>
              <td colSpan={3}>
                Assuming linear population growth, <CountOfPeople count={territory!.population} /> *{' '}
                {numberToFixedUnlessSmall(populationSpeakingPercent!)}% =
              </td>
            </tr>
            <tr>
              <td>Language population, adjusted</td>
              <td>{TerritoryDataYear}</td>
              <CellPopulation population={populationAdjusted} />
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};

export default LocalePopulationBreakdownAdjusted;
