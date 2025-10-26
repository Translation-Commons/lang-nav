import React from 'react';

import { usePageParams } from '@features/page-params/usePageParams';

import {
  getVitalityEthnologueCoarseLabel,
  getVitalityEthnologueFineLabel,
  getVitalityISOLabel,
} from '@entities/language/vitality/VitalityStrings';
import {
  VitalityISO,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

import Selector from '../components/Selector';

export const VitalityISOSelector: React.FC = () => {
  const { vitalityISO, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="ISO Language Status"
      selectorDescription="Filter languages by their ISO status (Living, Extinct, etc.)"
      options={[
        VitalityISO.Living,
        VitalityISO.Constructed,
        VitalityISO.Historical,
        VitalityISO.Extinct,
        VitalityISO.SpecialCode,
      ]}
      onChange={(value: VitalityISO) =>
        vitalityISO.includes(value)
          ? updatePageParams({ vitalityISO: vitalityISO.filter((v) => v !== value) })
          : updatePageParams({ vitalityISO: [...vitalityISO, value] })
      }
      selected={vitalityISO}
      getOptionLabel={getVitalityISOLabel}
    />
  );
};

export const VitalityEth2013Selector: React.FC = () => {
  const { vitalityEth2013, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Ethnologue 2013 Status"
      selectorDescription="Filter languages by their Ethnologue 2013 vitality classification"
      options={[
        VitalityEthnologueFine.National,
        VitalityEthnologueFine.Regional,
        VitalityEthnologueFine.Trade,
        VitalityEthnologueFine.Educational,
        VitalityEthnologueFine.Developing,
        VitalityEthnologueFine.Threatened,
        VitalityEthnologueFine.Shifting,
        VitalityEthnologueFine.Moribund,
        VitalityEthnologueFine.Dormant,
        VitalityEthnologueFine.Extinct,
      ]}
      onChange={(value: VitalityEthnologueFine) =>
        vitalityEth2013.includes(value)
          ? updatePageParams({ vitalityEth2013: vitalityEth2013.filter((v) => v !== value) })
          : updatePageParams({ vitalityEth2013: [...vitalityEth2013, value] })
      }
      selected={vitalityEth2013}
      getOptionLabel={getVitalityEthnologueFineLabel}
    />
  );
};

export const VitalityEth2025Selector: React.FC = () => {
  const { vitalityEth2025, updatePageParams } = usePageParams();

  return (
    <Selector
      selectorLabel="Ethnologue 2025 Status"
      selectorDescription="Filter languages by their Ethnologue 2025 vitality classification"
      options={[
        VitalityEthnologueCoarse.Institutional,
        VitalityEthnologueCoarse.Stable,
        VitalityEthnologueCoarse.Endangered,
        VitalityEthnologueCoarse.Extinct,
      ]}
      onChange={(value: VitalityEthnologueCoarse) =>
        vitalityEth2025.includes(value)
          ? updatePageParams({ vitalityEth2025: vitalityEth2025.filter((v) => v !== value) })
          : updatePageParams({ vitalityEth2025: [...vitalityEth2025, value] })
      }
      selected={vitalityEth2025}
      getOptionLabel={getVitalityEthnologueCoarseLabel}
    />
  );
};

const VitalitySelector: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <VitalityISOSelector />
      <VitalityEth2013Selector />
      <VitalityEth2025Selector />
    </div>
  );
};

export default VitalitySelector;
