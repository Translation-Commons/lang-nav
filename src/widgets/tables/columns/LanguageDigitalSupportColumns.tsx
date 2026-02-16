import { ObjectType } from '@features/params/PageParamTypes';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';

import LanguageDigitalSupportCell, {
  LanguageDigitalSupportDescription,
} from '@entities/language/LanguageDigitalSupportCell';
import { LanguageData } from '@entities/language/LanguageTypes';
import { ObjectCLDRCoverageLevel, ObjectCLDRLocaleCount } from '@entities/ui/CLDRCoverageInfo';
import { CoverageLevelsExplanation } from '@entities/ui/CLDRCoverageLevels';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';
import {
  WikipediaActiveUsers,
  WikipediaArticles,
  WikipediaLink,
  WikipediaStatusDisplay,
} from '@entities/ui/ObjectWikipediaInfo';

import { getDigitalSupportLabel } from '@strings/DigitalSupportStrings';

const columns: TableColumn<LanguageData>[] = [
  {
    key: 'Digital Support (Ethnologue)',
    description: <LanguageDigitalSupportDescription />,
    render: (lang) => <LanguageDigitalSupportCell lang={lang} />,
    exportValue: (lang) => getDigitalSupportLabel(lang.Ethnologue.digitalSupport),
  },
  {
    key: 'CLDR Coverage Level',
    description: (
      <>
        CLDR data is collected in tiers, later tiers include data from the prior tier.{' '}
        <CoverageLevelsExplanation />
      </>
    ),
    render: (lang) => (
      <>
        <ObjectCLDRCoverageLevel object={lang} />
        <CLDRWarningNotes object={lang} />
      </>
    ),
    exportValue: (lang) => lang.CLDR.coverage?.actualCoverageLevel,
  },
  {
    key: 'CLDR Locales',
    description: (
      <>
        The number of locales in CLDR, variations of languages for different regions and uses. For
        example Italian <code>it</code> has 4 variations: <code>it_IT</code>, <code>it_CH</code>,{' '}
        <code>it_SM</code>, and <code>it_VA</code>.
      </>
    ),
    render: (lang) => <ObjectCLDRLocaleCount object={lang} />,
    valueType: TableValueType.Count,
    exportValue: (lang) => lang.CLDR.coverage?.countOfCLDRLocales,
  },
  {
    key: 'ICU Support',
    render: (lang) => <ICUSupportStatus object={lang} />,
    exportValue: (lang) => {
      if (lang.CLDR.coverage?.inICU !== undefined) return lang.CLDR.coverage.inICU;
      if (lang.CLDR.dataProvider?.type === ObjectType.Language)
        return lang.CLDR.dataProvider.CLDR.coverage?.inICU;
      return undefined;
    },
  },
  {
    key: 'Wikipedia Status',
    render: (object) => (
      <>
        <WikipediaStatusDisplay object={object} />
        <WikipediaLink object={object} />
      </>
    ),
  },
  {
    key: 'Wikipedia Articles',
    render: (object) => <WikipediaArticles object={object} />,
    valueType: TableValueType.Count,
  },
  {
    key: 'Wikipedia Active Users',
    render: (object) => <WikipediaActiveUsers object={object} />,
    valueType: TableValueType.Population,
  },
];

export const LanguageDigitalSupportColumns: TableColumn<LanguageData>[] = columns.map(
  (col: TableColumn<LanguageData>) => ({
    ...col,
    isInitiallyVisible: false,
    columnGroup: 'Digital Support',
  }),
);
