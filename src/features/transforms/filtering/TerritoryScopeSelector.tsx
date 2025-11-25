import React from 'react';

import { ObjectType, View } from '@features/params/PageParamTypes';
import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import { TerritoryScope } from '@entities/types/DataTypes';

const TerritoryScopeSelector: React.FC = () => {
  const { territoryScopes, updatePageParams, objectType, view } = usePageParams();

  if (
    ![ObjectType.Territory, ObjectType.Locale].includes(objectType) &&
    !(view === View.Reports && objectType === ObjectType.Census)
  ) {
    return null; // Only applicable for territory and locale objects
  }

  const selectorDescription =
    'Filter what level of territories are shown, such as countries, regions, and dependencies.';

  return (
    <Selector
      selectorLabel="Territory Type"
      labelWhenEmpty="Any"
      selectorDescription={selectorDescription}
      options={Object.values(TerritoryScope)}
      onChange={(scope: TerritoryScope) =>
        territoryScopes.includes(scope)
          ? updatePageParams({ territoryScopes: territoryScopes.filter((s) => s != scope) })
          : updatePageParams({ territoryScopes: [...territoryScopes, scope] })
      }
      selected={territoryScopes}
    />
  );
};

export default TerritoryScopeSelector;
