import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { LocaleData } from '@entities/locale/LocaleTypes';

import Deemphasized from '@shared/ui/Deemphasized';

import CensusRecordsForLocale from './CensusRecordsForLocale';

const CensusCountForLocale: React.FC<{ locale: LocaleData }> = ({ locale }) => {
  return (
    <Hoverable hoverContent={<CensusRecordsForLocale locale={locale} />}>
      {locale.censusRecords?.length || <Deemphasized>—</Deemphasized>}
    </Hoverable>
  );
};

export default CensusCountForLocale;
