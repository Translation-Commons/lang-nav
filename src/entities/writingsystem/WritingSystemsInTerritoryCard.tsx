import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { getFilterByConnections } from '@features/transforms/filtering/filterByConnections';

import { getWritingSystemsInObject } from '@entities/lib/getObjectMiscFields';
import { TerritoryData } from '@entities/territory/TerritoryTypes';

type Props = {
  territory: TerritoryData;
};

const WritingSystemsInTerritoryCard: React.FC<Props> = ({ territory }) => {
  const [showAll, setShowAll] = React.useState(false);
  const filterByConnections = getFilterByConnections();

  const writingSystems = getWritingSystemsInObject(territory)?.filter(filterByConnections) ?? [];
  // Make an array to show the top 5 and ones originating to show in the card by default if it is not expanded
  const limitedWritingSystems = writingSystems.filter(
    (ws, i) => i < 5 || (ws.territoryOfOriginCode === territory.ID && i < 10),
  );
  return (
    <div>
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.25em' }}>
        Writing Systems used in <HoverableObjectName object={territory} />
      </h3>
      <>
        Click to see a table with all writing systems known to be used in {territory.nameDisplay}.{' '}
        {writingSystems.length === 0 && 'There are no writing systems known in this territory.'}
        {writingSystems.length === 1 && `There is 1 writing system in this territory:`}
        {writingSystems.length > 1 &&
          `There are ${writingSystems.length} writing systems in this territory:`}
      </>
      {(showAll ? writingSystems : limitedWritingSystems).map((ws) => (
        <div key={ws.ID} style={{ marginLeft: '1em' }}>
          <HoverableObjectName object={ws} /> [{ws.codeDisplay}]{' '}
          {ws.territoryOfOriginCode === territory.ID && '(originated here)'}
        </div>
      ))}
      {writingSystems && writingSystems.length > limitedWritingSystems.length && (
        <div style={{ marginLeft: '1em' }}>
          <button onClick={() => setShowAll(!showAll)} style={{ padding: '0.25em' }}>
            {showAll
              ? 'show less'
              : `+${writingSystems.length - limitedWritingSystems.length} more`}
          </button>
        </div>
      )}
    </div>
  );
};

export default WritingSystemsInTerritoryCard;
