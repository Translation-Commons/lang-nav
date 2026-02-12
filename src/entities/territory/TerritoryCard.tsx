import { BlocksIcon, EarthIcon, FlagIcon, LanguagesIcon, UsersIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';

import { TerritoryData, TerritoryScope } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import { uniqueBy } from '@shared/lib/setUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

interface Props {
  territory: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { population, ID, sovereign, locales, scope, parentUNRegion } = territory;
  const { updatePageParams } = usePageParams();
  const filterByScope = getScopeFilter();
  const localeList = locales ? Object.values(locales) : [];
  const isDependency = scope === TerritoryScope.Dependency;
  const isWorld = scope === TerritoryScope.World;

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={territory} />
        </a>
      </h3>
      <CardField
        title="Territory Type"
        icon={BlocksIcon}
        description="The kind of territory this is (e.g., country, dependency, region, continent)."
      >
        {scope != null ? scope : <Deemphasized>Unknown</Deemphasized>}
        {isDependency && sovereign ? (
          <>
            {' '}
            of <HoverableObjectName object={sovereign} />
          </>
        ) : null}
      </CardField>

      <CardField
        title="UN Region"
        icon={EarthIcon}
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
        icon={UsersIcon}
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
        icon={LanguagesIcon}
        description="Languages spoken in this territory."
      >
        {localeList.length > 0 ? (
          <CommaSeparated>
            {uniqueBy(localeList, (loc: any) => loc.languageCode)
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
