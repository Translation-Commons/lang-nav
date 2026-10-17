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
    key: 'Endangerment (Glottolog)',
    description: (
      <>
        This data available from Glottolog, based on the data from the no-longer-available UNESCO
        Atlas of the World&apos;s Language in Danger. See more information on the app for this:{' '}
        <ExternalLink href="https://cainesap.shinyapps.io/langmap/" />
      </>
    ),
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Glottolog} />,
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
