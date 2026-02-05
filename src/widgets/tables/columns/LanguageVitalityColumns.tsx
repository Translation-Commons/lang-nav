import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import { SortBy } from '@features/transforms/sorting/SortTypes';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageVitalityCell from '@entities/language/vitality/LanguageVitalityCell';
import { VitalitySource } from '@entities/language/vitality/VitalityTypes';

const LanguageVitalityColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Vitality: Metascore',
    labelInColumnGroup: 'Metascore',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Metascore} />,
    sortParam: SortBy.VitalityMetascore,
    valueType: TableValueType.Enum,
    isInitiallyVisible: true,
  },
  {
    key: 'ISO Status',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.ISO} />,
    sortParam: SortBy.ISOStatus,
    valueType: TableValueType.Enum,
  },
  {
    key: 'Vitality: Ethnologue (Fine)',
    labelInColumnGroup: 'from Ethnologue (Fine)',
    description:
      'Vitality as scored on the Extended Graded Intergenerational Disruption Scale directly from or derived from Ethnologue in 2012',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Eth2012} />,
    sortParam: SortBy.VitalityEthnologueFine,
    valueType: TableValueType.Enum,
  },
  {
    key: 'Vitality: Ethnologue (Coarse)',
    labelInColumnGroup: 'from Ethnologue (Coarse)',
    description:
      'Vitality as scored on the Extended Graded Intergenerational Disruption Scale, grouped into coarse categories directly from or derived from Ethnologue in 2025',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Eth2025} />,
    sortParam: SortBy.VitalityEthnologueCoarse,
    valueType: TableValueType.Enum,
  },
];

export default LanguageVitalityColumns.map((col) => ({
  ...col,
  isInitiallyVisible: col.isInitiallyVisible ?? false,
  columnGroup: 'Vitality',
}));
