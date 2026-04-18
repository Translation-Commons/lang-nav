import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import { uniqueBy } from '@shared/lib/setUtils';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

const LanguageSpeakersByTerritorySection: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  // Get locales from unique territories
  const locales = uniqueBy(
    lang.locales
      .filter((loc) => loc.territory?.scope === TerritoryScope.Country)
      .sort(sortByPopulation),
    (locale) => locale.territoryCode || '',
  );

  if (locales.length === 0) return null;

  const top10 = locales.slice(0, 10);
  const remaining = locales.length - 10;
  const rows = Math.ceil(Math.min(locales.length, 10) / 2);

  return (
    <DetailsSection title="Speakers by Territory">
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
            <HoverableObjectName object={locale} labelSource="territory" />
            <span>
              <CountOfPeople count={locale.populationAdjusted} />
              {locale.populationSpeakingPercent != null && (
                <Deemphasized> ({locale.populationSpeakingPercent.toFixed(1)}%)</Deemphasized>
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
