import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';

import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import CardTitleBlock from '@entities/ui/CardTitleBlock';

import CardField from '@shared/containers/CardField';
import CountOfPeople from '@shared/ui/old/CountOfPeople';
import Deemphasized from '@shared/ui/old/Deemphasized';

import TerritoryLanguageList from './TerritoryLanguageList';

interface Props {
  territory: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { population, scope, parentUNRegion } = territory;
  const isWorld = scope === TerritoryScope.World;

  return (
    <div>
      <CardTitleBlock object={territory} />
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
