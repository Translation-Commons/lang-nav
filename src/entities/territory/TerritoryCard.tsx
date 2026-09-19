import React from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityFieldDisplay from '@features/transforms/fields/EntityFieldDisplay';
import Field from '@features/transforms/fields/Field';
import useActiveTransforms from '@features/transforms/useActiveTransforms';

import EntityTitle from '@entities/ui/EntityTitle';

import CardField from '@shared/containers/CardField';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import TerritoryLanguageList from './TerritoryLanguageList';
import { TerritoryData, TerritoryScope } from './TerritoryTypes';

interface Props {
  territory: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { pop, sovereign, scope, parentUNRegion } = territory;
  const isDependency = scope === TerritoryScope.Dependency;
  const isWorld = scope === TerritoryScope.World;

  const extraFields = useActiveTransforms([
    Field.Name,
    Field.Code,
    Field.Population,
    Field.Region,
    Field.TerritoryScope,
    Field.Language,
  ]);

  return (
    <div>
      <div style={{ fontSize: '1.5em', marginBottom: '0.5em' }}>
        <EntityTitle ent={territory} />
      </div>
      <CardField field={Field.TerritoryScope}>
        {scope != null ? getTerritoryScopeLabel(scope) : <Deemphasized>Unknown</Deemphasized>}
        {isDependency && sovereign ? (
          <>
            {' '}
            of <HoverableEntityName ent={sovereign} />
          </>
        ) : null}
      </CardField>

      <CardField field={Field.Region}>
        {parentUNRegion ? (
          <HoverableEntityName ent={parentUNRegion} />
        ) : isWorld ? (
          <Deemphasized>Global</Deemphasized>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField field={Field.Population}>
        {pop != null ? <CountOfPeople count={pop.overall} /> : <Deemphasized>Unknown</Deemphasized>}
      </CardField>

      <CardField field={Field.Language}>
        <TerritoryLanguageList territory={territory} />
      </CardField>

      {extraFields.map((field) => (
        <CardField key={field} field={field}>
          <EntityFieldDisplay ent={territory} field={field} />
        </CardField>
      ))}
    </div>
  );
};

export default TerritoryCard;
