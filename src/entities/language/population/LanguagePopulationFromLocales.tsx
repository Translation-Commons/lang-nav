import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { ObjectType, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { TerritoryScope } from '@entities/types/DataTypes';

import CellPopulation from '@shared/containers/CellPopulation';
import { groupBy, sumBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

import { LanguageData } from '../LanguageTypes';

const LanguagePopulationFromLocales: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationFromLocales) return null;

  return (
    <Hoverable hoverContent={<LanguagePopulationBreakdownFromLocales lang={lang} />}>
      <CountOfPeople count={lang.populationFromLocales} />
    </Hoverable>
  );
};

export const LanguagePopulationBreakdownFromLocales: React.FC<{ lang: LanguageData }> = ({
  lang,
}) => {
  const { updatePageParams } = usePageParams();

  const localesFromUniqueTerritories = Object.values(
    groupBy(
      lang.locales
        .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
        .sort((a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0)),
      (locale) => locale.territoryCode || '',
    ),
  ).map((locales) => locales[0]);

  return (
    <>
      Computed by adding up populations from data in countries across the world, linearly adjusted
      to 2025 numbers.
      <table>
        <tbody>
          {localesFromUniqueTerritories
            .slice(0, 10) /* limit to first 10 */
            .map((locale) => (
              <tr key={locale.ID}>
                <td>
                  <HoverableObjectName object={locale} labelSource="territory" />
                </td>
                <CellPopulation population={locale.populationAdjusted} />
              </tr>
            ))}
          {localesFromUniqueTerritories.length > 10 && (
            <tr>
              <td>+{localesFromUniqueTerritories.length - 10} more</td>
              <CellPopulation
                population={sumBy(
                  localesFromUniqueTerritories.slice(10),
                  (locale) => locale.populationAdjusted || 0,
                )}
              />
            </tr>
          )}
        </tbody>
      </table>
      <HoverableButton
        onClick={() =>
          updatePageParams({
            languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
            view: View.Table,
            objectType: ObjectType.Locale,
          })
        }
        style={{ display: 'block' }}
      >
        See more details in the locale table
      </HoverableButton>
    </>
  );
};

export default LanguagePopulationFromLocales;
