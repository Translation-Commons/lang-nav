import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { TerritoryData } from '@entities/types/DataTypes';

import { getCensusCollectorTypeRank } from './CensusTypes';

type Props = {
  territory: TerritoryData;
};

const CensusesInTerritory: React.FC<Props> = ({ territory }) => {
  const [showAll, setShowAll] = React.useState(false);

  const censuses = (territory.censuses ?? [])
    .sort((a, b) => b.yearCollected - a.yearCollected)
    .sort(
      (a, b) =>
        getCensusCollectorTypeRank(a.collectorType) - getCensusCollectorTypeRank(b.collectorType),
    );
  return (
    <div>
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.25em' }}>
        <HoverableObjectName object={territory} /> Census Tables
      </h3>
      <>
        Click to see a table with all censuses tables for this territory available in LangNav.{' '}
        {censuses.length == 0 && 'No census tables in this territory.'}
        {censuses.length === 1 && 'There is 1 census table in this territory:'}
        {censuses.length > 1 && `There are ${censuses.length} census tables in this territory:`}
      </>
      {censuses.slice(0, showAll ? censuses.length : 5).map((census) => (
        <div key={census.ID} style={{ marginLeft: '1em' }}>
          <HoverableObjectName object={census} />
        </div>
      ))}
      {censuses.length > 5 && (
        <div style={{ marginLeft: '1em' }}>
          <button onClick={() => setShowAll(!showAll)} style={{ padding: '0.25em' }}>
            {showAll ? 'show less' : `+${censuses.length - 5} more`}
          </button>
        </div>
      )}
    </div>
  );
};

export default CensusesInTerritory;
