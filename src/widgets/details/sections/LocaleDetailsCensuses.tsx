import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import computeCensusRecordPriority from '@features/data/compute/computeCensusRecordPriority';
import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';

import CensusRecordPriority from '@entities/census/CensusRecordPriority';
import { LocaleData } from '@entities/locale/LocaleTypes';

import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import { PercentageDifference } from '@shared/ui/PercentageDifference';
import '../details.css';

const LocaleDetailsCensuses: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { censusRecords, pop } = locale;

  if (pop.speaking.unadjusted == null && pop.writing.unadjusted == null) return null;

  if (!censusRecords?.length) return null;

  const topCensusPriority = {
    speaking: Math.max(...censusRecords.map((r) => computeCensusRecordPriority(r, 'speaking'))),
    writing: Math.max(...censusRecords.map((r) => computeCensusRecordPriority(r, 'writing'))),
  };

  return (
    <DetailsSection title="All Population Records" score={censusRecords?.length}>
      {censusRecords && censusRecords.length > 0 && (
        <table style={{ width: 'fit-content' }}>
          <thead>
            <tr>
              <th>Population</th>
              <th>Percent</th>
              <th>Census</th>
              <th>Difference</th>
              <th colSpan={2}>
                <Hoverable hoverContent="When comparing censuses, this indicates which estimate is used for the canonical population count. The first rank is for the speaking population, the second rank is for the writing population.">
                  Priority
                </Hoverable>
              </th>
            </tr>
          </thead>
          <tbody>
            {censusRecords
              .sort((a, b) => b.populationPercent - a.populationPercent)
              .map((censusEstimate) => (
                <tr key={censusEstimate.census.ID}>
                  <td className="px-2 text-right">
                    <CountOfPeople count={censusEstimate.populationEstimate} />
                  </td>
                  <td className="px-2 text-right">
                    <DecimalNumber num={censusEstimate.populationPercent} />%
                  </td>
                  <td className="px-2">
                    <HoverableEntityName ent={censusEstimate.census} />
                  </td>
                  <td className="px-2 text-right">
                    <PercentageDifference
                      percentNew={censusEstimate.populationPercent}
                      percentOld={pop.speaking.percent}
                    />
                  </td>
                  <td className="px-2">
                    <CensusRecordPriority
                      record={censusEstimate}
                      focus="speaking"
                      topCensusPriority={topCensusPriority}
                    />
                  </td>
                  <td className="px-2">
                    <CensusRecordPriority
                      record={censusEstimate}
                      focus="writing"
                      topCensusPriority={topCensusPriority}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </DetailsSection>
  );
};

export default LocaleDetailsCensuses;
