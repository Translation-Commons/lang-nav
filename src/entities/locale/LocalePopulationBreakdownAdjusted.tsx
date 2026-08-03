import React from 'react';

import TerritoryDataYear from '@features/data/context/TerritoryDataYear';
import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import CellLabel from '@shared/containers/CellLabel';
import CellPercent from '@shared/containers/CellPercent';
import CellPopulation from '@shared/containers/CellPopulation';
import { numberToFixedUnlessSmall } from '@shared/lib/numberUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLocaleName } from './LocaleStrings';

const LocalePopulationBreakdownAdjusted: React.FC<{
  locale: LocaleData;
  use: 'speaking' | 'writing';
}> = ({ locale, use }) => {
  const { pop, territory } = locale;
  const { unadjusted, adjusted, percent, source, census, literacyDiscount, modalityDiscount } =
    pop[use];
  // Since our methodology is still improving, we are not yet rendering breakdowns for 0 values.
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
          <td>Source</td>
          <td colSpan={2} style={{ textAlign: 'right' }}>
            {census ? (
              <HoverableObjectName object={census} />
            ) : (
              <Deemphasized>No citation</Deemphasized>
            )}
          </td>
        </tr>
        <tr>
          <td>Original {localeNameWithoutTerritory} estimate</td>
          <td>{(!fromCLDR && census?.yearCollected) || <Deemphasized>unknown</Deemphasized>}</td>
          <CellPopulation population={unadjusted} />
        </tr>
        <tr>
          <td colSpan={2}>% of {territoryName} from estimate</td>
          <CellPercent percent={percent} showPercentSign alignFraction={false} />
        </tr>
        {literacyDiscount != null && literacyDiscount != 1 && (
          <tr>
            <td colSpan={2}>Literacy in {territoryName}</td>
            <CellPercent percent={literacyDiscount * 100} showPercentSign alignFraction={false} />
          </tr>
        )}
        {modalityDiscount != null && modalityDiscount != 1 && (
          <tr>
            <td colSpan={2}>
              <Hoverable hoverContent="When the original estimate doesn't specifically measure speaking or writing, we adjust the original population estimate based on if the language is primary spoken as opposed to written and vice-versa.">
                Modality discount
              </Hoverable>
            </td>
            <CellPercent percent={modalityDiscount * 100} showPercentSign alignFraction={false} />
          </tr>
        )}
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
          <CellPopulation population={territory.pop.overall} />
        </tr>
        {isAdjusted && (
          <>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', paddingRight: '1em' }}>
                <CountOfPeople count={territory!.pop.overall} />
                <> * {numberToFixedUnlessSmall(percent!)}%</>
                {literacyDiscount != null && literacyDiscount !== 1 && (
                  <> * {numberToFixedUnlessSmall(literacyDiscount * 100)}%</>
                )}{' '}
                {modalityDiscount != null && modalityDiscount !== 1 && (
                  <> * {numberToFixedUnlessSmall(modalityDiscount * 100)}%</>
                )}{' '}
                =
              </td>
            </tr>
            <tr>
              <td>Adjusted population</td>
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
