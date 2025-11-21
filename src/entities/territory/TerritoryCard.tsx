import React from 'react';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import usePageParams from '@features/page-params/usePageParams';
import { getScopeFilter } from '@features/transforms/filtering/filter';

import { TerritoryData } from '@entities/types/DataTypes';
import ObjectTitle from '@entities/ui/ObjectTitle';

import CommaSeparated from '@shared/ui/CommaSeparated';

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
          <ObjectTitle object={territory} highlightSearchMatches={true} />
        </a>
      </h3>
      <div>
        <h4>Population</h4>
        {population.toLocaleString()}
      </div>

      {locales && locales.length > 0 && (
        <div>
          <h4>Languages:</h4>
          <CommaSeparated>
            {Object.values(locales)
              .filter(filterByScope)
              .map((locale) => (
                <HoverableObjectName key={locale.ID} labelSource="language" object={locale} />
              ))}
          </CommaSeparated>
        </div>
      )}

      {sovereign != null && (
        <div>
          <h4>Part of:</h4>
          <HoverableObjectName object={sovereign} />
        </div>
      )}
    </div>
  );
};

export default TerritoryCard;
