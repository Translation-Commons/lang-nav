import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import ExternalLink from '@shared/ui/ExternalLink';

import type { LanguageData } from '../LanguageTypes';

import LanguageVitalityCell from './LanguageVitalityCell';
import { getVitalityLabel } from './VitalityStrings';
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
    key: 'Endangerment (Glottolog 2018)',
    description: (
      <>
        This data was collected by Andrew Caines et al. as part of the Glottolog Data Explorer. It
        contains data from the UNESCO Atlas of the World&apos;s Language in Danger published in 2010
        with some additions and some potential coding errors (many have been withheld from this
        display). See the host website from Glottolog at:{' '}
        <ExternalLink href="https://cainesap.shinyapps.io/langmap/" />
      </>
    ),
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.Glottolog} />,
    exportValue: (lang) =>
      lang.vitality?.glottolog != null
        ? getVitalityLabel(lang, VitalitySource.Glottolog)
        : undefined,
  },
  {
    key: 'Endangerment (UNESCO 2010)',
    description: (
      <>
        This data is from the 2010 edition of UNESCO&apos;s Atlas of the World&apos;s Language in
        Danger. See the publication:
        <ExternalLink href="https://unesdoc.unesco.org/ark:/48223/pf0000187026" />.
      </>
    ),
    render: (lang) => <LanguageVitalityCell lang={lang} src={VitalitySource.UNESCO} />,
    field: Field.Endangerment,
    exportValue: (lang) =>
      lang.vitality?.unesco != null ? getVitalityLabel(lang, VitalitySource.UNESCO) : undefined,
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
