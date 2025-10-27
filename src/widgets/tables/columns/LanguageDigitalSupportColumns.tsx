import TableColumn from '@features/table/TableColumn';

import { LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageText, ICUSupportStatus } from '@entities/ui/CLDRCoverageInfo';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

export const LanguageDigitalSupportColumns: TableColumn<LanguageData>[] = [
  {
    key: 'CLDR Coverage',
    label: 'CLDR Coverage',
    render: (lang) => <CLDRCoverageText object={lang} />,
    isInitiallyVisible: false,
    columnGroup: 'Digital Support',
  },
  {
    key: 'ICU Support',
    label: 'ICU Support',
    render: (lang) => <ICUSupportStatus object={lang} />,
    isInitiallyVisible: false,
    columnGroup: 'Digital Support',
  },
  {
    key: 'Wikipedia',
    render: (object) => <ObjectWikipediaInfo object={object} size="compact" />,
    isInitiallyVisible: false,
    columnGroup: 'Digital Support',
  },
];
