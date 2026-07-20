import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { TerritoryData } from '@entities/territory/TerritoryTypes';

import { Button } from '@shared/ui/button';

import { getCensusCollectorTypeRank } from './CensusTypes';

type Props = {
  territory: TerritoryData;
};

const CensusesInTerritory: React.FC<Props> = ({ territory }) => {
  const [showAll, setShowAll] = React.useState(false);

  const censuses = (territory.censuses ?? [])
    .slice()
    .sort((a, b) => b.yearCollected - a.yearCollected)
    .sort(
      (a, b) =>
        getCensusCollectorTypeRank(a.collectorType) - getCensusCollectorTypeRank(b.collectorType),
    );
  return (
    <div>
      <h3 className="font-bold mb-1">
        <HoverableObjectName object={territory} /> Census Tables
      </h3>
      <>
        Click to see a table with all census tables for this territory available in LangNav.{' '}
        {censuses.length === 0 && 'No census tables in this territory.'}
        {censuses.length === 1 && 'There is 1 census table in this territory:'}
        {censuses.length > 1 && `There are ${censuses.length} census tables in this territory:`}
      </>
      {censuses.slice(0, showAll ? censuses.length : 5).map((census) => (
        <div key={census.ID} className="ml-4">
          <HoverableObjectName object={census} />
        </div>
      ))}
      {censuses.length > 5 && (
        <div className="ml-4">
          <Button variant="link" size="xs" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'show less' : `+${censuses.length - 5} more`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CensusesInTerritory;
