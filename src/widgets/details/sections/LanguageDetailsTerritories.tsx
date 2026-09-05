import React, { useMemo } from 'react';

import { getViewIcon } from '@widgets/controls/selectors/ViewDisplay';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import { View } from '@features/params/PageParamTypes';

import LanguageTerritories from '@entities/language/LanguageTerritories';
import { LanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const LanguageDetailsTerritories: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  const [sectionView, setSectionView] = React.useState(View.CardList);

  const locales = useMemo(
    () =>
      uniqueBy(
        (lang.locales ?? []).filter(
          (l) =>
            l.territoryCode &&
            l.writingSystem == null &&
            l.territory?.scope === TerritoryScope.Country,
        ),
        (l) => l.territoryCode || '',
      ),
    [lang.locales],
  );

  if (locales.length === 0) return null;

  return (
    <DetailsSection
      score={locales.length}
      startCollapsed={true}
      title="Territories"
      headerOptions={
        <Tabs value={sectionView} onValueChange={setSectionView}>
          <TabsList>
            {Object.values([View.CardList, View.Table, View.Map]).map((v) => (
              <TabsTrigger key={v} value={v} className="cursor-pointer">
                {getViewIcon(v)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <LanguageTerritories lang={lang} view={sectionView} />
    </DetailsSection>
  );
};

export default LanguageDetailsTerritories;
