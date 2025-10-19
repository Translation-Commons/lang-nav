import { SortBy } from '@features/sorting/SortTypes';
import { TableColumn } from '@features/table/ObjectTable';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageVitalityCell from '@entities/language/LanguageVitalityCell';
import { VitalityMeterType } from '@entities/language/LanguageVitalityComputation';

export const LanguageVitalityColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Vitality: Metascore',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Metascore} />,
    sortParam: SortBy.VitalityMetascore,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: ISO',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.ISO} />,
    sortParam: SortBy.VitalityISO,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: Ethnologue 2013',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Eth2013} />,
    sortParam: SortBy.VitalityEthnologue2013,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: Ethnologue 2025',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalityMeterType.Eth2025} />,
    sortParam: SortBy.VitalityEthnologue2025,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
];
