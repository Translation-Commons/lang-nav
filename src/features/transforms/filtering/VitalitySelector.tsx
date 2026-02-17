import React from 'react';

import Selector from '@features/params/ui/Selector';
import usePageParams from '@features/params/usePageParams';

import {
  getLanguageISOStatusLabel,
  getVitalityEthnologueCoarseDescription,
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineDescription,
  getVitalityEthnologueFineLabel,
} from '@entities/language/vitality/VitalityStrings';
import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

const ETH_DISABLED = true;

export const LanguageISOStatusSelector: React.FC = () => {
  const { isoStatus, updatePageParams } = usePageParams();

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
    />
  );
};

export const VitalityEthFineSelector: React.FC = () => {
  const { vitalityEthFine, updatePageParams } = usePageParams();
  if (ETH_DISABLED) return null;

  return (
    <Selector
      selectorLabel="Vitality Eth (Fine)"
      selectorDescription="Filter languages by their Extended Graded Intergenerational Disruption Scale (EGIDS) vitality classification sourced from Ethnologue in 2012"
      labelWhenEmpty="Any"
      options={Object.values(VitalityEthnologueFine).filter((v) => typeof v === 'number')}
      onChange={(value: VitalityEthnologueFine) =>
        vitalityEthFine.includes(value)
          ? updatePageParams({ vitalityEthFine: vitalityEthFine.filter((v) => v !== value) })
          : updatePageParams({ vitalityEthFine: [...vitalityEthFine, value] })
      }
      selected={vitalityEthFine}
      getOptionLabel={getVitalityEthnologueFineLabel}
      getOptionDescription={getVitalityEthnologueFineDescription}
    />
  );
};

export const VitalityEthCoarseSelector: React.FC = () => {
  const { vitalityEthCoarse, updatePageParams } = usePageParams();
  if (ETH_DISABLED) return null;

  return (
    <Selector
      selectorLabel="Vitality Eth (Coarse)"
      selectorDescription="Filter languages by their Ethnologue 2025 vitality classification, a coarser scale than the 2012 EGIDS"
      labelWhenEmpty="Any"
      options={Object.values(VitalityEthnologueCoarse).filter((v) => typeof v === 'number')}
      onChange={(value: VitalityEthnologueCoarse) =>
        vitalityEthCoarse.includes(value)
          ? updatePageParams({ vitalityEthCoarse: vitalityEthCoarse.filter((v) => v !== value) })
          : updatePageParams({ vitalityEthCoarse: [...vitalityEthCoarse, value] })
      }
      selected={vitalityEthCoarse}
      getOptionLabel={getVitalityEthnologueCoarseLabel}
      getOptionDescription={getVitalityEthnologueCoarseDescription}
    />
  );
};
