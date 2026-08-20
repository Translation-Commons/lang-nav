import React from 'react';

import computeCensusRecordPriority, {
  buildCensusRecordPriorityInformation,
  CensusPrioritizingFactor,
  CensusRecordPriorityInfo,
} from '@features/data/compute/computeCensusRecordPriority';
import Hoverable from '@features/layers/hovercard/Hoverable';

import { LocaleInCensus } from '@entities/locale/LocaleTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';

type Props = {
  record: LocaleInCensus;
  focus: 'speaking' | 'writing';
  allRecords: LocaleInCensus[];
};

const CensusRecordPriority: React.FC<Props> = ({ record, focus, allRecords }) => {
  const priority = computeCensusRecordPriority(record, focus);
  const priorityParts = buildCensusRecordPriorityInformation(record, focus);
  const highestPriority = Math.max(...allRecords.map((r) => computeCensusRecordPriority(r, focus)));

  return (
    <Hoverable
      hoverContent={
        <table>
          <thead>
            <tr>
              <th>Priority Factor</th>
              <th>Value</th>
              <th>Score</th>
              <th>Weight</th>
            </tr>
          </thead>
          <tbody>
            {priorityParts.map((priorityInfo) => (
              <PriorityPartRow
                key={priorityInfo.factor}
                censusRecord={record}
                priorityInfo={priorityInfo}
              />
            ))}
          </tbody>
        </table>
      }
      style={{
        backgroundColor: highestPriority === priority ? 'var(--color-highlight)' : 'transparent',
      }}
    >
      <DecimalNumber num={priority} />
    </Hoverable>
  );
};

const PriorityPartRow: React.FC<{
  censusRecord: LocaleInCensus;
  priorityInfo: CensusRecordPriorityInfo;
}> = ({ censusRecord, priorityInfo }) => {
  const { factor, score, weight } = priorityInfo;
  return (
    <tr>
      <td>{factor}</td>
      <td>
        <PriorityValue censusRecord={censusRecord} factor={factor} />
      </td>
      <td>{score.toFixed(2)}</td>
      <td>{weight}</td>
    </tr>
  );
};

const PriorityValue: React.FC<{
  censusRecord: LocaleInCensus;
  factor: CensusPrioritizingFactor;
}> = ({ censusRecord, factor }) => {
  switch (factor) {
    case CensusPrioritizingFactor.Population:
      return <DecimalNumber num={censusRecord.populationPercent} />;
    case CensusPrioritizingFactor.AcquisitionOrder:
      return censusRecord.census.acquisitionOrder;
    case CensusPrioritizingFactor.YearCollected:
      return censusRecord.census.yearCollected ?? <Deemphasized>Unknown</Deemphasized>;
    case CensusPrioritizingFactor.LanguageUse:
      return censusRecord.census.languageUse;
    default:
      enforceExhaustiveSwitch(factor);
  }
};

export default CensusRecordPriority;
