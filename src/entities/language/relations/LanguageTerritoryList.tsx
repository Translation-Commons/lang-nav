import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import usePageParams from '@features/params/usePageParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguageTerritoryList: React.FC<Props> = ({ lang }) => {
  const { territoryScopes } = usePageParams();
  const locales = (
    lang.locales?.filter(
      (loc) =>
        loc.territory?.scope === TerritoryScope.Country ||
        (territoryScopes.includes(TerritoryScope.Dependency) &&
          loc.territory?.scope === TerritoryScope.Dependency),
    ) ?? []
  ).sort(sortByPopulation);

  return locales.length > 0 ? (
    <CommaSeparated>
      {uniqueBy(locales, (loc) => loc.territoryCode ?? '').map((locale) => (
        <HoverableEntityName key={locale.ID} labelSource="territory" ent={locale} />
      ))}
    </CommaSeparated>
  ) : (
    <Deemphasized>Unknown</Deemphasized>
  );
};

export default LanguageTerritoryList;
