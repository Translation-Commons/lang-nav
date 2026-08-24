import React, { useCallback } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { EntityType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import CellPopulation from '@shared/containers/CellPopulation';
import { groupBy, sumBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
  speakingOrWriting: 'speaking' | 'writing';
};

const LanguagePopulationFromLocales: React.FC<Props> = ({ lang, speakingOrWriting }) => {
  const { updatePageParams } = usePageParams();
  if (!lang.pop[speakingOrWriting].fromLocales) return null;
  const onClick = useCallback(() => {
    updatePageParams({
      languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
      view: View.Table,
      entityType: EntityType.Locale,
    });
  }, [updatePageParams, lang]);

  return (
    <Hoverable
      hoverContent={
        <LanguagePopulationBreakdownFromLocales lang={lang} speakingOrWriting={speakingOrWriting} />
      }
      onClick={onClick}
    >
      <CountOfPeople count={lang.pop[speakingOrWriting].fromLocales} />
    </Hoverable>
  );
};

export const LanguagePopulationBreakdownFromLocales: React.FC<Props> = ({
  lang,
  speakingOrWriting,
}) => {
  const filterFunc = (scope?: TerritoryScope) =>
    scope === TerritoryScope.Country || scope === TerritoryScope.Dependency;
  const sortFunc = (a: LocaleData, b: LocaleData) =>
    (b.pop[speakingOrWriting].adjusted || 0) - (a.pop[speakingOrWriting].adjusted || 0);

  const localesFromUniqueTerritories = Object.values(
    groupBy(
      lang.locales.filter((loc) => filterFunc(loc.territory?.scope)).sort(sortFunc),
      (locale) => locale.territoryCode || '',
    ),
  ).map((locales) => locales[0]);

  return (
    <>
      Computed by adding up the {speakingOrWriting} populations from data in countries across the
      world, linearly adjusted to 2025 numbers. Click to see the full table.
      <table>
        <tbody>
          {localesFromUniqueTerritories
            .slice(0, 10) /* limit to first 10 */
            .map((locale) => (
              <tr key={locale.ID}>
                <td>
                  <HoverableObjectName ent={locale} labelSource="territory" />
                </td>
                <CellPopulation population={locale.pop[speakingOrWriting].adjusted} />
              </tr>
            ))}
          {localesFromUniqueTerritories.length > 10 && (
            <tr>
              <td>+{localesFromUniqueTerritories.length - 10} more</td>
              <CellPopulation
                population={sumBy(
                  localesFromUniqueTerritories.slice(10),
                  (locale) => locale.pop[speakingOrWriting].adjusted || 0,
                )}
              />
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default LanguagePopulationFromLocales;
