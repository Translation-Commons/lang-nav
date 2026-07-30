import { SearchIcon } from 'lucide-react';
import React, { PropsWithChildren, useState } from 'react';

import HoverableIcon from '@features/layers/hovercard/HoverableIcon';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationBreakdown from '@entities/locale/LocalePopulationBreakdown';
import { LocaleData } from '@entities/locale/LocaleTypes';

import DetailsSection from '@shared/containers/DetailsSection';
import DetailsStatBlock from '@shared/containers/DetailsStatBlock';
import CountOfPeople from '@shared/ui/CountOfPeople';
import DecimalNumber from '@shared/ui/DecimalNumber';
import Deemphasized from '@shared/ui/Deemphasized';
import { PercentageDifference } from '@shared/ui/PercentageDifference';

import '../details.css';

const LocalePopulationSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { censusRecords, pop } = locale;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const toggleBreakdown = () => setShowBreakdown((prev) => !prev);

  if (pop.speaking.unadjusted == null && pop.writing.unadjusted == null) return null;

  return (
    <>
      <div className="DetailsRow">
        <MajorPopulationBox
          locale={locale}
          use="speaking"
          toggleBreakdown={toggleBreakdown}
          showBreakdown={showBreakdown}
        />
        <MajorPopulationBox
          locale={locale}
          use="writing"
          toggleBreakdown={toggleBreakdown}
          showBreakdown={showBreakdown}
        />
      </div>
      <DetailsSection title="All Population Records">
        {censusRecords && censusRecords.length > 0 && (
          <table style={{ borderSpacing: '1em 1em', width: 'fit-content' }}>
            <thead>
              <tr>
                <th>Population</th>
                <th>Percent</th>
                <th>Census</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {censusRecords
                .sort((a, b) => b.populationPercent - a.populationPercent)
                .map((censusEstimate) => (
                  <tr key={censusEstimate.census.ID}>
                    <td style={{ textAlign: 'right' }}>
                      <CountOfPeople count={censusEstimate.populationEstimate} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <DecimalNumber num={censusEstimate.populationPercent} />%
                    </td>
                    <td>
                      <HoverableObjectName object={censusEstimate.census} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <PercentageDifference
                        percentNew={censusEstimate.populationPercent}
                        percentOld={pop.speaking.percent}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </DetailsSection>
    </>
  );
};

const MajorPopulationBox: React.FC<{
  locale: LocaleData;
  use: 'speaking' | 'writing';
  toggleBreakdown: () => void;
  showBreakdown: boolean;
}> = ({ locale, use, toggleBreakdown, showBreakdown }) => {
  const pop = locale.pop[use];

  return (
    <div className="DetailsBox">
      <DetailsSection
        title={
          <Title toggleBreakdown={toggleBreakdown}>
            Population ({use === 'writing' ? 'Writing' : 'Speaking'})
          </Title>
        }
      >
        {showBreakdown && <LocalePopulationBreakdown locale={locale} use={use} />}
        {pop.adjusted == null ? (
          <Deemphasized>No population data available.</Deemphasized>
        ) : (
          <div className="DetailsStatContainer">
            <DetailsStatBlock
              label={
                <>
                  <LocaleCensusCitation locale={locale} use={use} />
                  {pop.adjusted != pop.unadjusted && <span>, adjusted</span>}
                </>
              }
            >
              <CountOfPeople count={pop.adjusted} />
            </DetailsStatBlock>
          </div>
        )}
      </DetailsSection>
    </div>
  );
};

const Title: React.FC<PropsWithChildren<{ toggleBreakdown: () => void }>> = ({
  toggleBreakdown,
  children,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {children}
      <div style={{ fontSize: '0.5em' }}>
        <HoverableIcon Icon={SearchIcon} onClick={toggleBreakdown} description="Show breakdown" />
      </div>
    </div>
  );
};

export default LocalePopulationSection;
