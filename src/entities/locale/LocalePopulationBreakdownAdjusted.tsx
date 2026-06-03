import React from 'react';

import TerritoryDataYear from '@features/data/context/TerritoryDataYear';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

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
    pop: {
      speaking: { unadjusted, adjusted, percent, source, census },
    },
    territory,
  } = locale;
  if (!unadjusted || !adjusted || !territory || !percent) return null;

  const localeNameWithoutTerritory = getLocaleName(locale, false);
  const territoryName = locale.territory?.nameDisplay || 'territory';
  const fromCLDR = census?.presentedBy === 'CLDR' || source === PopulationSourceCategory.CLDR;
  const isAdjusted = adjusted !== unadjusted;

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
          <td>{(!fromCLDR && census?.yearCollected) || <Deemphasized>unknown</Deemphasized>}</td>
          <CellPopulation population={unadjusted} />
        </tr>
        <tr>
          <td colSpan={2}>% of {territoryName}</td>
          <CellPercent percent={percent} showPercentSign alignFraction={false} />
        </tr>
        <tr>
          <td colSpan={2}>Source</td>
          <td>
            {census ? (
              <HoverableObjectName object={census} />
            ) : (
              <Deemphasized>No citation</Deemphasized>
            )}
          </td>
        </tr>
        {/* Show the population of the territory used to compute the percent if there is a different number from the source */}
        {(fromCLDR || census?.yearCollected) && (
          <tr>
            <td>{territoryName} population</td>
            <td>{fromCLDR ? 'in CLDR' : (census?.yearCollected ?? 'from source')}</td>
            <CellPopulation population={(unadjusted / percent) * 100} />
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
                {numberToFixedUnlessSmall(percent!)}% =
              </td>
            </tr>
            <tr>
              <td>Language population, adjusted</td>
              <td>{TerritoryDataYear}</td>
              <CellPopulation population={adjusted} />
            </tr>
          </>
        )}
      </tbody>
    </table>
  );
};

export default LocalePopulationBreakdownAdjusted;
