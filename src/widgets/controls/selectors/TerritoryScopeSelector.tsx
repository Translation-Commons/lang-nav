import { TerritoryScope } from '@entities/types/DataTypes';
import { ObjectType, View } from '@widgets/PageParamTypes';
import React from 'react';

import { usePageParams } from '../../PageParamsProvider';
import Selector from '../components/Selector';

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
