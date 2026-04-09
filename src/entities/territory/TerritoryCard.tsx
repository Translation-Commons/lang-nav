import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import TerritoryLanguageList from './TerritoryLanguageList';

interface Props {
  territory: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { population, sovereign, scope, parentUNRegion } = territory;
  const isDependency = scope === TerritoryScope.Dependency;
  const isWorld = scope === TerritoryScope.World;

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <ObjectTitle object={territory} />
      </div>
      <CardField
        title="Territory Type"
        field={Field.TerritoryScope}
        description="The kind of territory this is (e.g., country, dependency, region, continent)."
      >
        {scope != null ? getTerritoryScopeLabel(scope) : <Deemphasized>Unknown</Deemphasized>}
        {isDependency && sovereign ? (
          <>
            {' '}
            of <HoverableObjectName object={sovereign} />
          </>
        ) : null}
      </CardField>

      <CardField
        title="UN Region"
        field={Field.Region}
        description="The United Nations regional grouping this territory belongs to."
      >
        {parentUNRegion ? (
          <HoverableObjectName object={parentUNRegion} />
        ) : isWorld ? (
          <Deemphasized>Global</Deemphasized>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Population"
        field={Field.Population}
        description="How many people live in this territory."
      >
        {population != null ? (
          <CountOfPeople count={population} />
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Languages"
        field={Field.Language}
        description="Languages spoken in this territory."
      >
        <TerritoryLanguageList territory={territory} />
      </CardField>
    </div>
  );
};

export default TerritoryCard;
