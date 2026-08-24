import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageModalityUserLabel } from '@strings/LanguageModalityStrings';

const LanguageSpeakersByTerritorySection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const use = lang.pop.overall == lang.pop.speaking.estimate ? 'speaking' : 'writing';
  // Get locales from unique territories
  const filterFunc = (loc: (typeof lang.locales)[number]) =>
    loc.territory?.scope === TerritoryScope.Country ||
    loc.territory?.scope === TerritoryScope.Dependency;
  const locales = uniqueBy(
    lang.locales.filter(filterFunc).sort(sortByPopulation),
    (locale) => locale.territoryCode || '',
  );

  if (locales.length === 0) return null;

  const top10 = locales.slice(0, 10);
  const remaining = locales.length - 10;
  const rows = Math.ceil(Math.min(locales.length, 10) / 2);

  return (
    <DetailsSection title={getLanguageModalityUserLabel(lang.modality, use) + ' by Territory'}>
      <div
        style={{
          display: 'grid',
          gap: '0.5em 2em',
          gridTemplateColumns: `repeat(${locales.length > 1 ? 2 : 1}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          gridAutoFlow: 'column',
        }}
      >
        {top10.map((locale) => (
          <div
            key={locale.ID}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <HoverableEntityName ent={locale} labelSource="territory" />
            <span style={{ textAlign: 'end' }}>
              <CountOfPeople count={locale.pop[use].adjusted} />
              {locale.pop[use].percent != null && (
                <Deemphasized> ({locale.pop[use].percent.toFixed(1)}%)</Deemphasized>
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
