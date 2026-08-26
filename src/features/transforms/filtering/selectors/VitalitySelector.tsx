import React from 'react';

import Selector from '@features/params/ui/Selector';
import { useSelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';

import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

export const LanguageISOStatusSelector: React.FC = () => {
  const { isoStatus, updatePageParams } = usePageParams();
  const { display } = useSelectorDisplay();
  return (
    <Selector
      selectorLabel="ISO Language Status"
      selectorDescription="Filter languages by their ISO status (Living, Extinct, etc.)"
      labelWhenEmpty="Any"
      options={Object.values(LanguageISOStatus).filter((v) => typeof v === 'number')}
      onChange={(value: LanguageISOStatus) =>
        isoStatus.includes(value)
          ? updatePageParams({ isoStatus: isoStatus.filter((v) => v !== value) })
          : updatePageParams({ isoStatus: [...isoStatus, value] })
      }
      selected={isoStatus}
      getOptionLabel={getLanguageISOStatusLabel}
      display={display}
    />
  );
};
