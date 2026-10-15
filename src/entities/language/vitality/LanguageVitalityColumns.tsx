import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import ExternalLink from '@shared/ui/ExternalLink';

import type { LanguageData } from '../LanguageTypes';

import LanguageVitalityCell from './LanguageVitalityCell';
import { VitalitySource } from './VitalityTypes';

const LanguageVitalityColumns: TableColumn<LanguageData>[] = [
  {
    key: 'Vitality: Metascore',
    labelInColumnGroup: 'Metascore',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Metascore} />,
    field: Field.VitalityMetascore,
    isInitiallyVisible: false,
  },
  {
    key: 'Endangerment (UNESCO 2010)',
    description: (
      <>
        This data is available from UNESCO, based on the data from UNESCO&apos;s Atlas of the
        World&apos;s Language in Danger published in 2010. See the publication:
        <ExternalLink href="https://unesdoc.unesco.org/ark:/48223/pf0000187026" />, and an
        interactive tool from Glottolog:{' '}
        <ExternalLink href="https://cainesap.shinyapps.io/langmap/" />
      </>
    ),
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.UNESCO} />,
    field: Field.Endangerment,
  },
  {
    key: 'ISO Status',
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.ISO} />,
    field: Field.ISOStatus,
    isInitiallyVisible: true,
  },
];

export default LanguageVitalityColumns.map((col) => ({
  ...col,
  isInitiallyVisible: col.isInitiallyVisible ?? false,
  columnGroup: 'Vitality',
}));
