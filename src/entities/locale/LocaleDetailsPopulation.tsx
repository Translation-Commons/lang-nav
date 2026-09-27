import { SearchIcon } from 'lucide-react';
import React, { useState } from 'react';

import DetailsRow from '@widgets/details/ui/DetailsRow';
import DetailsSection from '@widgets/details/ui/DetailsSection';
import DetailsStatBlock from '@widgets/details/ui/DetailsStatBlock';
import DetailsStatContainer from '@widgets/details/ui/DetailsStatContainer';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import PopulationFocus from '@entities/types/PopulationFocus';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';
import { Toggle } from '@shared/ui/toggle';

import LocaleCensusCitation from './LocaleCensusCitation';
import LocalePopulationBreakdown from './LocalePopulationBreakdown';
import type { LocaleData } from './LocaleTypes';

const LocaleDetailsPopulation: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { pop } = locale;
  const [showBreakdown, setShowBreakdown] = useState(false);
  const toggleBreakdown = () => setShowBreakdown((prev) => !prev);

  if (pop.speaking.unadjusted == null && pop.writing.unadjusted == null) return null;

  return (
    <>
      <DetailsRow>
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
      </DetailsRow>
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
    <div className="grow shrink basis-[200px]">
      <DetailsSection
        title={`Population (${speakingOrWriting})`}
        headerOptions={
          <Toggle
            aria-label="Toggle population breakdown"
            className="cursor-pointer"
            title="Toggle population breakdown"
            onPressedChange={toggleBreakdown}
            pressed={showBreakdown}
            variant="outline"
          >
            <SearchIcon />
          </Toggle>
        }
        isCollapsible={false}
      >
        {showBreakdown && (
          <LocalePopulationBreakdown locale={locale} speakingOrWriting={speakingOrWriting} />
        )}
        {pop.adjusted == null ? (
          <Deemphasized>No population data available.</Deemphasized>
        ) : (
          <DetailsStatContainer>
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
          </DetailsStatContainer>
        )}
      </DetailsSection>
    </div>
  );
};

export default LocaleDetailsPopulation;
