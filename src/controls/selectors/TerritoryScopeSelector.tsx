import React from 'react';

import { TerritoryScope } from '../../types/DataTypes';
import { ObjectType } from '../../types/PageParamTypes';
import MultiChoiceOptions from '../components/MultiChoiceOptions';
import Selector from '../components/Selector';
import { usePageParams } from '../PageParamsContext';

const TerritoryScopeSelector: React.FC = () => {
  const { territoryScopes, updatePageParams, objectType } = usePageParams();

  if (![ObjectType.Territory, ObjectType.Locale].includes(objectType)) {
    return null; // Only application for territory and locale objects
  }

  const selectorDescription =
    'Filter what level of territories are shown, such as countries, regions, and dependencies.';

  return (
    <Selector selectorLabel="Territory Scope:" selectorDescription={selectorDescription}>
      <MultiChoiceOptions
        options={Object.values(TerritoryScope)}
        onToggleOption={(scope: TerritoryScope) =>
          territoryScopes.includes(scope)
            ? updatePageParams({ territoryScopes: territoryScopes.filter((s) => s != scope) })
            : updatePageParams({ territoryScopes: [...territoryScopes, scope] })
        }
        selected={territoryScopes}
      />
    </Selector>
  );
};

export default TerritoryScopeSelector;
