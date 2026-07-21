import React from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { LocaleData } from '@entities/locale/LocaleTypes';

import { Button } from '@shared/ui/button';
import CountOfPeople from '@shared/ui/old/CountOfPeople';

type Props = {
  locale: LocaleData;
};

const CensusRecordsForLocale: React.FC<Props> = ({ locale }) => {
  const [showAll, setShowAll] = React.useState(false);

  const censusRecords = locale.censusRecords ?? [];
  return (
    <div>
      <h3 className="font-bold mb-1">
        <HoverableObjectName object={locale} /> Population Records
      </h3>
      <div>
        {censusRecords.length === 0 &&
          'No population records for this locale available in LangNav.'}
        {censusRecords.length === 1 &&
          'There is 1 population record for this locale available in LangNav:'}
        {censusRecords.length > 1 &&
          `There are ${censusRecords.length} population records in this locale available in LangNav:`}
      </div>
      {censusRecords.slice(0, showAll ? censusRecords.length : 5).map((censusRecord) => (
        <div key={censusRecord.census.ID} className="ml-4">
          <HoverableObjectName object={censusRecord.census} /> (
          <CountOfPeople count={censusRecord.populationEstimate} />)
        </div>
      ))}
      {censusRecords.length > 5 && (
        <div className="ml-4">
          <Button variant="link" size="xs" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'show less' : `+${censusRecords.length - 5} more`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CensusRecordsForLocale;
