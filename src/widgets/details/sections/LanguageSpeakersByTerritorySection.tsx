import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import CellPopulation from '@shared/containers/CellPopulation';
import DetailsSection from '@shared/containers/DetailsSection';
import { groupBy } from '@shared/lib/setUtils';
import Deemphasized from '@shared/ui/Deemphasized';

const LanguageSpeakersByTerritorySection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const localesFromUniqueTerritories = Object.values(
    groupBy(
      lang.locales
        .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
        .sort(sortByPopulation),
      (locale) => locale.territoryCode || '',
    ),
  ).map((locales) => locales[0]);

  if (localesFromUniqueTerritories.length === 0) return null;

  const top10 = localesFromUniqueTerritories.slice(0, 10);
  const leftCol = top10.slice(0, 5);
  const rightCol = top10.slice(5, 10);
  const remaining = localesFromUniqueTerritories.length - 10;

  return (
    <DetailsSection title="Speakers by Territory">
      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        {/* Left column */}
        <table style={{ flex: 1, borderSpacing: '0.5em 0.25em' }}>
          <tbody>
            {leftCol.map((locale) => (
              <tr key={locale.ID}>
                <td>
                  <HoverableObjectName object={locale} labelSource="territory" />
                </td>
                <CellPopulation
                  population={locale.populationAdjusted}
                  percent={locale.populationSpeakingPercent}
                />
              </tr>
            ))}
          </tbody>
        </table>
        {/* Right column */}
        <table style={{ flex: 1, borderSpacing: '0.5em 0.25em' }}>
          <tbody>
            {rightCol.map((locale) => (
              <tr key={locale.ID}>
                <td>
                  <HoverableObjectName object={locale} labelSource="territory" />
                </td>
                <CellPopulation
                  population={locale.populationAdjusted}
                  percent={locale.populationSpeakingPercent}
                />
              </tr>
            ))}
            {remaining > 0 && (
              <tr>
                <td colSpan={2}>
                  <Deemphasized>+{remaining} more</Deemphasized>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DetailsSection>
  );
};

export default LanguageSpeakersByTerritorySection;
