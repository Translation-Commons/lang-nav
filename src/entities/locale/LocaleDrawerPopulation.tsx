import React from 'react';

import DrawerDetailsField from '@widgets/details/ui/DrawerDetailsField';
import DrawerDetailsSection from '@widgets/details/ui/DrawerDetailsSection';

import { getSpeakingOrWritingFocus } from '@entities/lib/getSpeakingOrWritingFocus';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import LocalePopulationBreakdown from '@entities/locale/LocalePopulationBreakdown';
import { LocaleData } from '@entities/locale/LocaleTypes';
import PopulationFocus from '@entities/types/PopulationFocus';

import CountOfPeople from '@shared/ui/CountOfPeople';
import Deemphasized from '@shared/ui/Deemphasized';

import LocalePopulationRecords from './LocalePopulationRecords';

const LocaleDrawerPopulation: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { pop } = locale;

  if (pop.speaking.unadjusted == null && pop.writing.unadjusted == null) return null;

  return (
    <DrawerDetailsSection title="Population">
      <PopulationField locale={locale} focus={PopulationFocus.Speaking} />
      <PopulationField locale={locale} focus={PopulationFocus.Writing} />
      <Censuses locale={locale} />
    </DrawerDetailsSection>
  );
};

const PopulationField: React.FC<{
  locale: LocaleData;
  focus: PopulationFocus;
}> = ({ locale, focus }) => {
  const speakingOrWriting = getSpeakingOrWritingFocus(locale, focus);
  const pop = locale.pop[speakingOrWriting];

  return (
    <>
      <DrawerDetailsField
        label={`Population (${speakingOrWriting})`}
        hasData={pop?.adjusted !== null}
        expandedContent={
          <div className="w-fit">
            <LocalePopulationBreakdown locale={locale} speakingOrWriting={speakingOrWriting} />
          </div>
        }
      >
        {pop.adjusted == null ? (
          <Deemphasized>No population data available.</Deemphasized>
        ) : (
          <CountOfPeople count={pop.adjusted} />
        )}
      </DrawerDetailsField>
      <DrawerDetailsField label="Source" hasData={pop?.census !== null}>
        <LocaleCensusCitation locale={locale} focus={focus} />
        {pop.adjusted != pop.unadjusted && <span>, adjusted</span>}
      </DrawerDetailsField>
    </>
  );
};

const Censuses: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { censusRecords, pop } = locale;

  if (pop.speaking.unadjusted == null && pop.writing.unadjusted == null) return null;

  if (!censusRecords?.length) return null;

  return (
    <DrawerDetailsField
      label="All Population Records"
      hasData={!!censusRecords?.length}
      expandedContent={
        !!censusRecords?.length && (
          <LocalePopulationRecords locale={locale} showDifference={false} />
        )
      }
    >
      {censusRecords?.length || 'No data available'}
    </DrawerDetailsField>
  );
};

export default LocaleDrawerPopulation;
