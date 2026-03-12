import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Field from '@features/transforms/fields/Field';
import { getScopeFilter } from '@features/transforms/filtering/filter';

import { TerritoryData, TerritoryScope } from '@entities/territory/TerritoryTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import { uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

interface Props {
  territory: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { population, sovereign, locales, scope, parentUNRegion } = territory;
  const filterByScope = getScopeFilter();
  const localeList = locales ?? [];
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
        {localeList.length > 0 ? (
          <CommaSeparated>
            {uniqueBy(localeList, (loc) => loc.languageCode ?? loc.ID)
              .filter(filterByScope)
              .map((locale) => (
                <HoverableObjectName key={locale.ID} labelSource="language" object={locale} />
              ))}
          </CommaSeparated>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>
    </div>
  );
};

export default TerritoryCard;
