import React from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import LocalePopulationRecords from './LocalePopulationRecords';
import { LocaleData } from './LocaleTypes';

const LocaleDetailsCensuses: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const { censusRecords, pop } = locale;

  if (pop.speaking.unadjusted == null && pop.writing.unadjusted == null) return null;

  if (!censusRecords?.length) return null;

  return (
    <DetailsSection title="All Population Records" score={censusRecords?.length}>
      <LocalePopulationRecords locale={locale} showDifference={true} />
    </DetailsSection>
  );
};

export default LocaleDetailsCensuses;
