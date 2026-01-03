import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LocaleData, PopulationSourceCategory } from '@entities/types/DataTypes';

import LabelTableCell from '@shared/containers/CellLabel';
import CellPercent from '@shared/containers/CellPercent';
import CellPopulation from '@shared/containers/CellPopulation';
import { sumBy, uniqueBy } from '@shared/lib/setUtils';

import { getLocaleName } from './LocaleStrings';

const MAX_CONSTITUENTS_DISPLAYED = 5;

const LocalePopulationBreakdownAggregated: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { populationAdjusted, populationSource } = locale;
  const fromTerritories = populationSource === PopulationSourceCategory.AggregatedFromTerritories;
  const constituents = fromTerritories
    ? uniqueBy(locale.relatedLocales?.childTerritories || [], (l) => l.territoryCode || '')
    : uniqueBy(locale.relatedLocales?.childLanguages || [], (l) => l.languageCode).sort(
        (a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0),
      );
  const totalPercent =
    sumBy(constituents, (loc) => loc.populationSpeakingPercent) / constituents.length;

  return (
    <table>
      <tbody>
        <tr>
          {fromTerritories ? (
            <td colSpan={3}>
              Since the territory for this locale is a regional grouping, the data is added up from
              the populations of all constituent territories.
            </td>
          ) : (
            <td colSpan={3}>
              Since the locale is a language family grouping, the data is added up from the
              populations of all constituent languages in{' '}
              {<HoverableObjectName object={locale.territory} />}. This may cause double-counting.
            </td>
          )}
        </tr>
        <tr>
          <LabelTableCell>{fromTerritories ? 'Territories' : 'Languages'}</LabelTableCell>
          <LabelTableCell align="right">{getLocaleName(locale, false)} Population</LabelTableCell>
          <LabelTableCell align="right">% of territory</LabelTableCell>
        </tr>
        {constituents.slice(0, MAX_CONSTITUENTS_DISPLAYED).map((childLocale) => (
          <tr key={childLocale.ID}>
            <td style={{ paddingLeft: '1em' }}>
              <HoverableObjectName
                object={childLocale}
                labelSource={fromTerritories ? 'territory' : 'language'}
              />
            </td>
            <CellPopulation population={childLocale.populationAdjusted} />
            <CellPercent percent={childLocale.populationSpeakingPercent} />
          </tr>
        ))}
        <RowOfRemainingConstituents locales={constituents.slice(MAX_CONSTITUENTS_DISPLAYED)} />
        <tr>
          <LabelTableCell>
            <HoverableObjectName
              object={locale}
              labelSource={fromTerritories ? 'territory' : 'language'}
            />
          </LabelTableCell>
          <CellPopulation population={populationAdjusted} />
          <CellPercent percent={totalPercent > 100 ? 100 : totalPercent} />
        </tr>
      </tbody>
    </table>
  );
};

const RowOfRemainingConstituents: React.FC<{
  locales: LocaleData[];
}> = ({ locales }) => {
  if (locales.length === 0) return null;
  const totalInRemainder = sumBy(locales, (locale) => locale.populationAdjusted ?? 0);
  const percentInRemainder =
    (totalInRemainder * 100) / sumBy(locales, (locale) => locale.territory?.population || 0);

  return (
    <tr>
      <td style={{ paddingLeft: '1em' }}>
        +{locales.length} other{locales.length > 1 && 's'}
      </td>
      <CellPopulation population={totalInRemainder} />
      <CellPercent percent={percentInRemainder} />
    </tr>
  );
};

export default LocalePopulationBreakdownAggregated;
