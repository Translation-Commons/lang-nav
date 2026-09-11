import React, { useMemo } from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import { getEntityFullDescendants } from '@widgets/pathnav/getParentsAndDescendants';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import PopulationFocus from '@entities/types/PopulationFocus';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { LanguageData, LanguageScope } from '../LanguageTypes';

type Props = {
  lang: LanguageData;
};

const LanguageDrawerDialectsRow: React.FC<Props> = ({ lang }) => {
  const baseParams: Partial<PageParams> = {
    entType: EntityType.Language,
    entID: lang.ID, // Kept the drawer open, letting people manually close it
    populationFocus: PopulationFocus.Overall,
    languageFilter: lang.nameDisplay + ' [' + lang.ID + ']',
    languageScopes: [],
  };
  const dialects = useMemo(
    () =>
      getEntityFullDescendants(lang)
        .filter(
          (l) =>
            l.type === EntityType.Language &&
            (l.scope === LanguageScope.Dialect || l.scope === LanguageScope.Language),
        )
        .sort(sortByPopulation) as LanguageData[],
    [lang],
  );
  const childrenString = dialects.some((l) => l.scope === LanguageScope.Language)
    ? dialects.some((l) => l.scope === LanguageScope.Dialect)
      ? 'Languages and Dialects'
      : 'Languages'
    : 'Dialects';

  return (
    <DrawerDetailsField
      label={childrenString}
      hasData={dialects.length > 0}
      actions={[
        <DrawerActionButton key="hierarchy" view={View.Hierarchy} baseParams={baseParams} />,
        <DrawerActionButton key="map" view={View.Map} baseParams={baseParams} />,
        <DrawerActionButton key="table" view={View.Table} baseParams={baseParams} />,
      ]}
      expandedContent={
        <CommaSeparated limit={12}>
          {dialects.map((d) => (
            <HoverableEntityName key={d.ID} ent={d} />
          ))}
        </CommaSeparated>
      }
    >
      {dialects.length > 0 ? dialects.length.toLocaleString() : 'No dialects'}
    </DrawerDetailsField>
  );
};

export default LanguageDrawerDialectsRow;
