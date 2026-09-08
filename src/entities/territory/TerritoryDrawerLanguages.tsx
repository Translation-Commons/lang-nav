import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';

import { EntityType, View } from '@features/params/PageParamTypes';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { LanguageScope } from '@entities/language/LanguageTypes';
import SimpleLocaleTable from '@entities/locale/SimpleLocaleTable';
import PopulationFocus from '@entities/types/PopulationFocus';

import { uniqueBy } from '@shared/lib/setUtils';

import { TerritoryData } from './TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const TerritoryDrawerLanguages: React.FC<Props> = ({ territory }) => {
  const languages = uniqueBy(
    (territory.locales ?? [])
      .filter(
        (l) =>
          l.language?.scope === LanguageScope.Macrolanguage ||
          l.language?.scope === LanguageScope.Language,
      )
      .sort(sortByPopulation),
    (locale) => locale.languageCode,
  );

  return (
    <DrawerDetailsField
      label="Languages"
      hasData={languages.length > 0}
      expandedContent={
        <SimpleLocaleTable
          locales={languages}
          populationFocus={PopulationFocus.Speaking}
          labelSource="language"
        />
      }
      actions={
        <DrawerActionButton
          view={View.Table}
          baseParams={{
            entID: territory.ID,
            entType: EntityType.Locale,
            territoryFilter: territory.nameDisplay + ' [' + territory.ID + ']',
            territoryScopes: [territory.scope],
          }}
        />
      }
    >
      {languages.length.toLocaleString()}
    </DrawerDetailsField>
  );
};

export default TerritoryDrawerLanguages;
