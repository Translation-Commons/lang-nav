import { TriangleAlertIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LocaleData, PopulationSourceCategory } from '@entities/types/DataTypes';

import LabelTableCell from '@shared/containers/CellLabel';
import { sumBy, uniqueBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';

const MAX_CONSTITUENTS_DISPLAYED = 5;

const LocalePopulationBreakdownAggregated: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { populationAdjusted, populationSpeaking, populationSource } = locale;
  const fromTerritories = populationSource === PopulationSourceCategory.AggregatedFromTerritories;
  const constituents = fromTerritories
    ? uniqueBy(locale.relatedLocales?.childTerritories || [], (l) => l.territoryCode || '')
    : uniqueBy(locale.relatedLocales?.childLanguages || [], (l) => l.languageCode).sort(
        (a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0),
      );
  const totalPercent = sumBy(constituents, (loc) => loc.populationSpeakingPercent);

  return (
    <table>
      <tbody>
        <tr>
          <LabelTableCell>Population unadjusted, summed:</LabelTableCell>
          <td className="population">
            <CountOfPeople count={populationSpeaking!} />
          </td>
          <td className="decimal" style={{ whiteSpace: 'nowrap' }}>
            <DecimalNumber num={totalPercent > 100 ? 100 : totalPercent} alignFraction={false} />%
            {totalPercent > 100 && (
              <TriangleAlertIcon style={{ color: 'var(--color-text-yellow)' }} size="1em" />
            )}
          </td>
        </tr>
        <tr>
          <LabelTableCell>Population normalized to 2025:</LabelTableCell>
          <td className="population">
            <CountOfPeople count={populationAdjusted!} />
          </td>
        </tr>
        <tr>
          {fromTerritories ? (
            <td colSpan={2}>
              Since the territory for this locale is a regional grouping, the data is added up from
              the populations of all constituent territories:
            </td>
          ) : (
            <td colSpan={2}>
              Since the locale is a language family grouping, the data is added up from the
              populations of all constituent languages in{' '}
              {<HoverableObjectName object={locale.territory} />}. This may cause double-counting:
            </td>
          )}
        </tr>
        <tr>
          <LabelTableCell>Top constituents:</LabelTableCell>
          <td>Population</td>
          <td>Percent of territory</td>
        </tr>
        {constituents.slice(0, MAX_CONSTITUENTS_DISPLAYED).map((childLocale) => (
          <tr key={childLocale.ID}>
            <td style={{ paddingLeft: '1em' }}>
              <HoverableObjectName
                object={childLocale}
                labelSource={fromTerritories ? 'territory' : 'language'}
              />
            </td>
            <td className="population">
              <CountOfPeople count={childLocale.populationAdjusted} />
            </td>
            <td className="decimal">
              <DecimalNumber num={childLocale.populationSpeakingPercent} />%
            </td>
          </tr>
        ))}
        {constituents.length > MAX_CONSTITUENTS_DISPLAYED && (
          <tr>
            <td>
              {constituents.length - MAX_CONSTITUENTS_DISPLAYED} other
              {constituents.length > MAX_CONSTITUENTS_DISPLAYED + 1 && 's'}
            </td>
            <td className="population">
              <CountOfPeople
                count={constituents
                  .slice(MAX_CONSTITUENTS_DISPLAYED)
                  .reduce((sum, locale) => sum + (locale.populationAdjusted ?? 0), 0)}
              />
            </td>
            <td className="decimal">
              <DecimalNumber
                num={
                  (constituents
                    .slice(5)
                    .reduce((sum, locale) => sum + (locale.populationSpeakingPercent ?? 0), 0) /
                    constituents.length) *
                  100
                }
              />
              %
            </td>
          </tr>
        )}
        {sumBy(constituents, (loc) => loc.populationSpeakingPercent) > 100 && (
          <tr>
            <td colSpan={3}>
              <TriangleAlertIcon style={{ color: 'var(--color-text-yellow)' }} size="1em" />{' '}
              <em>
                Individual rows sum to more than 100% because of people that are counted in multiple
                constituent groups.
              </em>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default LocalePopulationBreakdownAggregated;
