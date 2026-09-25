import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import usePageParams from '@features/params/usePageParams';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageScope } from '@entities/language/LanguageTypes';

import { uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { TerritoryData } from './TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const TerritoryLanguageList: React.FC<Props> = ({ territory }) => {
  const { languageScopes } = usePageParams();

  const locales = (territory.locales ?? [])
    .filter(
      (loc) =>
        loc.language?.scope === LanguageScope.Language ||
        (languageScopes.includes(LanguageScope.Macrolanguage) &&
          loc.language?.scope === LanguageScope.Macrolanguage),
    )
    .sort(sortByPopulation);

  return locales.length > 0 ? (
    <CommaSeparated>
      {uniqueBy(locales, (loc) => loc.languageCode).map((locale) => (
        <HoverableEntityName key={locale.ID} labelSource="language" ent={locale} />
      ))}
    </CommaSeparated>
  ) : (
    <Deemphasized>Unknown</Deemphasized>
  );
};

export default TerritoryLanguageList;
