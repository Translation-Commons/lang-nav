import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';

import { LocaleData } from '@entities/types/DataTypes';

import { sumBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';

import LocaleCensusCitation from './LocaleCensusCitation';

const LocalePopulationFromDescendents: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const childLocales = [...(locale.familyLocales || []), ...(locale.containedLocales || [])].sort(
    (a, b) => (b.populationAdjusted ?? 0) - (a.populationAdjusted ?? 0),
  );
  if (!locale.populationSpeaking || childLocales.length === 0) return null;

  return (
    <>
      <CountOfPeople count={locale.populationSpeaking} />
      <br />
      Computed by adding up constituent locales.
      <table>
        <thead>
          <tr>
            <th>Locale</th>
            <th>Population</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {childLocales
            .slice(0, 10) // limit to first 10
            .map((descendant) => (
              <tr key={descendant.ID}>
                <td>
                  <HoverableObjectName object={descendant} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <CountOfPeople count={descendant.populationAdjusted} />
                </td>
                <td>
                  <LocaleCensusCitation locale={descendant} />
                </td>
              </tr>
            ))}
          {childLocales.length > 10 && (
            <tr>
              <td>+{childLocales.length - 10} more</td>
              <td style={{ textAlign: 'right' }}>
                <CountOfPeople
                  count={sumBy(
                    childLocales.slice(10),
                    (descendant) => descendant.populationAdjusted || 0,
                  )}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default LocalePopulationFromDescendents;
