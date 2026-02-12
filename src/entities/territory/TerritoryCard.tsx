import { GlobeIcon, FlagIcon, UsersIcon } from 'lucide-react';
import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';

import { TerritoryData } from '@entities/types/DataTypes';
import ObjectSubtitle from '@entities/ui/ObjectSubtitle';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CardField from '@shared/containers/CardField';
import CommaSeparated from '@shared/ui/CommaSeparated';
import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

interface Props {
  territory: TerritoryData;
}

const TerritoryCard: React.FC<Props> = ({ territory }) => {
  const { population, ID, sovereign, locales } = territory;
  const { updatePageParams } = usePageParams();
  const filterByScope = getScopeFilter();

  return (
    <div>
      <h3>
        <a onClick={() => updatePageParams({ objectID: ID })}>
          <ObjectTitle object={territory} />
        </a>
        <ObjectSubtitle object={territory} />
      </h3>
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
        icon={GlobeIcon}
        description="Languages spoken in this territory."
      >
        {locales && locales.length > 0 ? (
          <CommaSeparated>
            {Object.values(locales)
              .filter(filterByScope)
              .map((locale) => (
                <HoverableObjectName key={locale.ID} labelSource="language" object={locale} />
              ))}
          </CommaSeparated>
        ) : (
          <Deemphasized>Unknown</Deemphasized>
        )}
      </CardField>

      <CardField
        title="Part of"
        icon={FlagIcon}
        description="The larger entity this territory belongs to."
      >
        {sovereign ? (
          <HoverableObjectName object={sovereign} />
        ) : (
          <Deemphasized>Independent</Deemphasized>
        )}
      </CardField>
    </div>
  );
};

export default TerritoryCard;
