import { SearchIcon } from 'lucide-react';
import React, { PropsWithChildren, useState } from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';

import HoverableIcon from '@features/layers/hovercard/HoverableIcon';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationBreakdown from '@entities/locale/LocalePopulationBreakdown';
import { LocaleData } from '@entities/locale/LocaleTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

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
          focus={PopulationFocus.Speaking}
          toggleBreakdown={toggleBreakdown}
          showBreakdown={showBreakdown}
        />
        <MajorPopulationBox
          locale={locale}
          focus={PopulationFocus.Writing}
          toggleBreakdown={toggleBreakdown}
          showBreakdown={showBreakdown}
        />
      </div>
      <DetailsSection title="All Population Records">
        {censusRecords && censusRecords.length > 0 && (
          <table style={{ width: 'fit-content' }}>
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
                    <td className="px-2 text-right">
                      <CountOfPeople count={censusEstimate.populationEstimate} />
                    </td>
                    <td className="px-2 text-right">
                      <DecimalNumber num={censusEstimate.populationPercent} />%
                    </td>
                    <td className="px-2">
                      <HoverableObjectName object={censusEstimate.census} />
                    </td>
                    <td className="px-2 text-right">
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
  focus: PopulationFocus;
  toggleBreakdown: () => void;
  showBreakdown: boolean;
}> = ({ locale, focus, toggleBreakdown, showBreakdown }) => {
  const speakingOrWriting = getSpeakingOrWritingFocus(locale, focus);
  const pop = locale.pop[speakingOrWriting];

  return (
    <div className="DetailsBox">
      <DetailsSection
        title={<Title toggleBreakdown={toggleBreakdown}>Population ({speakingOrWriting})</Title>}
      >
        {showBreakdown && (
          <LocalePopulationBreakdown locale={locale} speakingOrWriting={speakingOrWriting} />
        )}
        {pop.adjusted == null ? (
          <Deemphasized>No population data available.</Deemphasized>
        ) : (
          <div className="DetailsStatContainer">
            <DetailsStatBlock
              label={
                <>
                  <LocaleCensusCitation locale={locale} focus={focus} />
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
