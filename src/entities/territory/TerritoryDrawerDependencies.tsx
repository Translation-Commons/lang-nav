import React from 'react';

import DrawerActionButton from '@widgets/details/ui/DrawerActionButton';
import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType, View } from '@features/params/PageParamTypes';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import CommaSeparated from '@shared/ui/CommaSeparated';

import { TerritoryData, TerritoryScope } from './TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const TerritoryDrawerDependencies: React.FC<Props> = ({ territory }) => {
  const dependencies = (territory.dependentTerritories ?? []).sort(sortByPopulation);

  if (dependencies.length === 0) return null;

  const baseParams = {
    entID: territory.ID,
    entType: EntityType.Territory,
    territoryFilter: territory.nameDisplay + ' [' + territory.ID + ']',
    territoryScopes: [TerritoryScope.Country, TerritoryScope.Dependency],
  };

  return (
    <DrawerDetailsField
      label="Dependencies"
      expandedContent={
        <CommaSeparated limit={null}>
          {dependencies.map((dt) => (
            <HoverableEntityName ent={dt} key={dt.ID} />
          ))}
        </CommaSeparated>
      }
      actions={[
        <DrawerActionButton key="table" view={View.Table} baseParams={baseParams} />,
        <DrawerActionButton key="map" view={View.Map} baseParams={baseParams} />,
      ]}
    >
      {dependencies.length.toLocaleString()}
    </DrawerDetailsField>
  );
};

export default TerritoryDrawerDependencies;
