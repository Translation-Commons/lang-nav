import React from 'react';

import HoverableObjectName from '@entities/ui/HoverableObjectName';

import { groupBy, sumBy } from '@shared/lib/setUtils';
import Hoverable from '@features/hovercard/Hoverable';

import { LanguageData } from './LanguageTypes';

const LanguagePopulationFromLocales: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang.populationFromLocales) return null;

  return (
    <Hoverable hoverContent={<Descendents lang={lang} />}>
      {lang.populationFromLocales.toLocaleString()}
    </Hoverable>
  );
};

const Descendents: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const localesFromUniqueTerritories = Object.values(
    groupBy(
      lang.locales.sort((a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0)),
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
                <td style={{ textAlign: 'right' }}>
                  {locale.populationAdjusted?.toLocaleString()}
                </td>
              </tr>
            ))}
          {localesFromUniqueTerritories.length > 10 && (
            <tr>
              <td>+{localesFromUniqueTerritories.length - 10} more</td>
              <td style={{ textAlign: 'right' }}>
                {sumBy(
                  localesFromUniqueTerritories.slice(10),
                  (locale) => locale.populationAdjusted || 0,
                ).toLocaleString()}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default LanguagePopulationFromLocales;
