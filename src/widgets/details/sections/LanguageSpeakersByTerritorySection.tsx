import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import { uniqueBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/old/CountOfPeople';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

const LanguageSpeakersByTerritorySection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  // Get locales from unique territories
  const locales = uniqueBy(
    lang.locales
      .filter(
        (loc) =>
          loc.territory?.scope === TerritoryScope.Country ||
          loc.territory?.scope === TerritoryScope.Dependency,
      )
      .sort(sortByPopulation),
    (locale) => locale.territoryCode || '',
  );

  if (locales.length === 0) return null;

  const top10 = locales.slice(0, 10);
  const remaining = locales.length - 10;
  const rows = Math.ceil(Math.min(locales.length, 10) / 2);

  return (
    <DetailsSection title={getLanguageModalityUserLabel(lang.modality) + ' by Territory'}>
      <div
        className="grid grid-flow-col gap-x-8 gap-y-2"
        style={{
          gridTemplateColumns: `repeat(${locales.length > 1 ? 2 : 1}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, auto)`,
        }}
      >
        {top10.map((locale) => (
          <div key={locale.ID} className="flex items-center justify-between">
            <HoverableObjectName object={locale} labelSource="territory" />
            <span className="text-end">
              <CountOfPeople count={locale.pop.speaking.adjusted} />
              {locale.pop.speaking.percent != null && (
                <Deemphasized> ({locale.pop.speaking.percent.toFixed(1)}%)</Deemphasized>
              )}
            </span>
          </div>
        ))}
      </div>
      {remaining > 0 && <Deemphasized>+{remaining} more</Deemphasized>}
    </DetailsSection>
  );
};

export default LanguageSpeakersByTerritorySection;
