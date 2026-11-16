import React from 'react';

import CardExtraFields from '@widgets/cardlists/CardExtraFields';
import CardField from '@widgets/cardlists/CardField';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import { Skeleton } from '@shared/ui/skeleton';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import TerritoryLanguageList from './TerritoryLanguageList';
import { TerritoryData, TerritoryScope } from './TerritoryTypes';

interface Props {
  territory?: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { pop, sovereign, scope, parentUNRegion } = territory ?? {};
  const isDependency = scope === TerritoryScope.Dependency;
  const isWorld = scope === TerritoryScope.World;

  return (
    <>
      <CardField field={Field.TerritoryScope}>
        {territory ? (
          <>
            {scope != null ? getTerritoryScopeLabel(scope) : <Deemphasized>Unknown</Deemphasized>}
            {isDependency && sovereign ? (
              <>
                {' '}
                of <HoverableEntityName ent={sovereign} />
              </>
            ) : null}
          </>
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.Region}>
        {territory ? (
          parentUNRegion ? (
            <HoverableEntityName ent={parentUNRegion} />
          ) : isWorld ? (
            <Deemphasized>Solar System</Deemphasized>
          ) : (
            <Deemphasized>Unknown</Deemphasized>
          )
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.Population}>
        {territory ? (
          pop != null ? (
            <CountOfPeople count={pop.overall} />
          ) : (
            <Deemphasized>Unknown</Deemphasized>
          )
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardField field={Field.LanguageList}>
        {territory ? (
          <TerritoryLanguageList territory={territory} />
        ) : (
          <Skeleton className="h-4 w-full" />
        )}
      </CardField>

      <CardExtraFields
        ent={territory}
        excludeFields={[
          Field.Name,
          Field.Code,
          Field.Population,
          Field.Region,
          Field.TerritoryScope,
          Field.LanguageList,
        ]}
      />
    </>
  );
};

export default TerritoryCard;
