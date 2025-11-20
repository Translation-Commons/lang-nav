import React from 'react';

import { getCldrLocale } from '@features/data-loading/cldrLocales';

import { LocaleData } from '@entities/types/DataTypes';

import DetailsField from '@shared/containers/DetailsField';
import DetailsSection from '@shared/containers/DetailsSection';
import Deemphasized from '@shared/ui/Deemphasized';

/** CLDR Support section */
const LocaleCLDRSupportSection: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  const cldr = getCldrLocale(locale.ID);
  if (!cldr) {
    return (
      <DetailsSection title="CLDR Support">
        <Deemphasized>Not supported by CLDR.</Deemphasized>
      </DetailsSection>
    );
  }
  return (
    <DetailsSection title="CLDR Support">
      <DetailsField title="Tier:">{cldr.tier}</DetailsField>
      <DetailsField title="Present in CLDR:">
        {cldr.presentInCLDRDatabase ? 'Yes' : 'No'}
      </DetailsField>
      <DetailsField title="Default Locale:">
        {cldr.localeIsDefaultForLanguage ? 'Yes' : 'No'}
      </DetailsField>
      <DetailsField title="Target / Computed Level:">
        {cldr.targetLevel ?? '—'} / {cldr.computedLevel ?? '—'}
      </DetailsField>
      {cldr.confirmedPct != null && (
        <DetailsField title="Confirmed %:">{cldr.confirmedPct.toFixed(1)}%</DetailsField>
      )}
      {cldr.icuIncluded != null && (
        <DetailsField title="ICU:">{cldr.icuIncluded ? 'Yes' : 'No'}</DetailsField>
      )}
      {cldr.missingCounts && (
        <DetailsField title="Missing Counts:">
          {cldr.missingCounts.found} found / {cldr.missingCounts.unconfirmed} unconfirmed /{' '}
          {cldr.missingCounts.missing} missing
        </DetailsField>
      )}
      {cldr.notes && cldr.notes.length > 0 && (
        <DetailsField title="Missing Features:">{cldr.notes.join(', ')}</DetailsField>
      )}
    </DetailsSection>
  );
};

export default LocaleCLDRSupportSection;
