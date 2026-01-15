import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LocaleData } from '@entities/types/DataTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';

type Props = {
  locale: LocaleData;
};

const CensusRecordsForLocale: React.FC<Props> = ({ locale }) => {
  const [showAll, setShowAll] = React.useState(false);

  const censusRecords = locale.censusRecords ?? [];
  return (
    <div>
      <h3 style={{ fontWeight: 'bold', marginBottom: '0.25em' }}>
        <HoverableObjectName object={locale} /> Population Records
      </h3>
      <div>
        {censusRecords.length == 0 && 'No population records for this locale available in LangNav.'}
        {censusRecords.length === 1 &&
          'There is 1 population record for this locale available in LangNav:'}
        {censusRecords.length > 1 &&
          `There are ${censusRecords.length} population records in this locale available in LangNav:`}
      </div>
      {censusRecords.slice(0, showAll ? censusRecords.length : 5).map((censusRecord) => (
        <div key={censusRecord.census.ID} style={{ marginLeft: '1em' }}>
          <HoverableObjectName object={censusRecord.census} /> (
          <CountOfPeople count={censusRecord.populationEstimate} />)
        </div>
      ))}
      {censusRecords.length > 5 && (
        <div style={{ marginLeft: '1em' }}>
          <button onClick={() => setShowAll(!showAll)} style={{ padding: '0.25em' }}>
            {showAll ? 'show less' : `+${censusRecords.length - 5} more`}
          </button>
        </div>
      )}
    </div>
  );
};

export default CensusRecordsForLocale;
