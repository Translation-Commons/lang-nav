import React from 'react';

import Selector from '@features/params/ui/Selector';
import { useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

const TerritoryScopeSelector: React.FC = () => {
  const { territoryScopes, updatePageParams } = usePageParams();
  const { display } = useSelectorDisplay();
  const selectorDescription =
    'Filter what level of territories are shown, such as countries, regions, and dependencies.';

  return (
    <Selector
      selectorLabel="Territory Type"
      labelWhenEmpty="Any"
      selectorDescription={selectorDescription}
      options={
        Object.values(TerritoryScope).filter((s) => typeof s === 'number') as TerritoryScope[]
      }
      onChange={(scope: TerritoryScope) =>
        territoryScopes.includes(scope)
          ? updatePageParams({ territoryScopes: territoryScopes.filter((s) => s != scope) })
          : updatePageParams({ territoryScopes: [...territoryScopes, scope] })
      }
      selected={territoryScopes}
      getOptionLabel={getTerritoryScopeLabel}
      display={display}
    />
  );
};

export default TerritoryScopeSelector;
