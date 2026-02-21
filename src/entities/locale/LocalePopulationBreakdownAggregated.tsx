import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';

import LabelTableCell from '@shared/containers/CellLabel';
import CellPercent from '@shared/containers/CellPercent';
import CellPopulation from '@shared/containers/CellPopulation';
import { sumBy, uniqueBy } from '@shared/lib/setUtils';

import { getLocaleName } from './LocaleStrings';

const MAX_CONSTITUENTS_DISPLAYED = 5;

const LocalePopulationBreakdownAggregated: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { populationAdjusted, populationSource, populationSpeakingPercent } = locale;
  const fromTerritories = populationSource === PopulationSourceCategory.AggregatedFromTerritories;
  const constituents = fromTerritories
    ? uniqueBy(locale.relatedLocales?.childTerritories || [], (l) => l.territoryCode || '')
    : uniqueBy(locale.relatedLocales?.childLanguages || [], (l) => l.languageCode).sort(
        sortByPopulation,
      );
  const [showAllConstituents, setShowAllConstituents] = React.useState(false);

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
        {constituents
          .slice(0, showAllConstituents ? constituents.length : MAX_CONSTITUENTS_DISPLAYED)
          .map((childLocale) => (
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
        {showAllConstituents ? (
          constituents.length > MAX_CONSTITUENTS_DISPLAYED && (
            <tr>
              <td colSpan={3}>
                <HoverableButton
                  style={{ padding: '0.25em', marginLeft: '1em' }}
                  onClick={() => setShowAllConstituents(false)}
                >
                  Show less
                </HoverableButton>
              </td>
            </tr>
          )
        ) : (
          <RowOfRemainingConstituents
            locales={constituents.slice(MAX_CONSTITUENTS_DISPLAYED)}
            setShowAllConstituents={setShowAllConstituents}
          />
        )}
        <tr>
          <LabelTableCell>
            <HoverableObjectName
              object={locale}
              labelSource={fromTerritories ? 'territory' : 'language'}
            />
          </LabelTableCell>
          <CellPopulation population={populationAdjusted} />
          <CellPercent
            leftContent={
              (populationSpeakingPercent ?? 0) >= 99.9 && (
                <TriangleAlertIcon size="1em" style={{ color: 'var(--color-text-yellow)' }} />
              )
            }
            percent={populationSpeakingPercent}
          />
        </tr>
        {(populationSpeakingPercent ?? 0) >= 99.9 && (
          <tr>
            <td colSpan={3}>
              The population of this locale{' '}
              {(populationSpeakingPercent ?? 0) > 100 ? 'exceeds' : 'is'} 100% of the territory
              population, which is likely not an accurate reflection of the people in the area.
              Rather, constituents may be double-counted but without specific data this is the best
              aggregate.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const RowOfRemainingConstituents: React.FC<{
  locales: LocaleData[];
  setShowAllConstituents: (show: boolean) => void;
}> = ({ locales, setShowAllConstituents }) => {
  if (locales.length === 0) return null;
  const totalInRemainder = sumBy(locales, (locale) => locale.populationAdjusted ?? 0);
  const percentInRemainder =
    (totalInRemainder * 100) / sumBy(locales, (locale) => locale.territory?.population || 0);

  return (
    <tr>
      <td style={{ paddingLeft: '1em' }}>
        <HoverableButton
          style={{ padding: '0.25em', fontWeight: 'normal' }}
          onClick={() => setShowAllConstituents(true)}
        >
          +{locales.length} other{locales.length > 1 && 's'}
        </HoverableButton>
      </td>
      <CellPopulation population={totalInRemainder} />
      <CellPercent percent={percentInRemainder} />
    </tr>
  );
};

export default LocalePopulationBreakdownAggregated;
