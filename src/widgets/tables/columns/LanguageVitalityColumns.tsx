import { SortBy } from '@features/sorting/SortTypes';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageVitalityCell from '@entities/language/vitality/LanguageVitalityCell';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';

export const LanguageVitalityColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Vitality: Metascore',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalitySource.Metascore} />,
    sortParam: SortBy.VitalityMetascore,
    valueType: TableValueType.Enum,
    columnGroup: 'Vitality',
  },
  {
    key: 'ISO Status',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalitySource.ISO} />,
    sortParam: SortBy.ISOStatus,
    isInitiallyVisible: false,
    valueType: TableValueType.Enum,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: Ethnologue 2013',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalitySource.Eth2013} />,
    sortParam: SortBy.VitalityEthnologue2013,
    valueType: TableValueType.Enum,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: Ethnologue 2025',
    render: (lang) => <LanguageVitalityCell lang={lang} type={VitalitySource.Eth2025} />,
    sortParam: SortBy.VitalityEthnologue2025,
    valueType: TableValueType.Enum,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
];
