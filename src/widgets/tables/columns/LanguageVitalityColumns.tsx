import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageVitalityCell from '@entities/language/vitality/LanguageVitalityCell';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';

export const LanguageVitalityColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Vitality: Metascore',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Metascore} />,
    sortParam: SortBy.VitalityMetascore,
    valueType: TableValueType.Enum,
    columnGroup: 'Vitality',
  },
  {
    key: 'ISO Status',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.ISO} />,
    sortParam: SortBy.ISOStatus,
    isInitiallyVisible: false,
    valueType: TableValueType.Enum,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: Ethnologue Fine',
    description:
      'Vitality as score don the Extended Graded Intergenerational Disruption Scale directly from or derived from Ethnologue in 2012',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Eth2012} />,
    sortParam: SortBy.VitalityEthnologueFine,
    valueType: TableValueType.Enum,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
  {
    key: 'Vitality: Ethnologue Coarse',
    description:
      'Vitality as score on the Extended Graded Intergenerational Disruption Scale, grouped into coarse categories directly from or derived from Ethnologue in 2025',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Eth2025} />,
    sortParam: SortBy.VitalityEthnologueCoarse,
    valueType: TableValueType.Enum,
    isInitiallyVisible: false,
    columnGroup: 'Vitality',
  },
];
