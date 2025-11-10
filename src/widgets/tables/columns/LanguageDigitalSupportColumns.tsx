import TableColumn from '@features/table/TableColumn';

import { LanguageData } from '@entities/language/LanguageTypes';
import {
  CLDRCoverageText,
  CoverageLevelsExplanation,
  ICUSupportStatus,
} from '@entities/ui/CLDRCoverageInfo';
import {
  WikipediaActiveUsers,
  WikipediaArticles,
  WikipediaLink,
  WikipediaStatusDisplay,
} from '@entities/ui/ObjectWikipediaInfo';

import LinkButton from '@shared/ui/LinkButton';

const columns: TableColumn<LanguageData>[] = [
  {
    key: 'Digital Support (Ethnologue)',
    description: (
      <>
        See more about the Digital Language Divide project on
        <LinkButton href="https://www.ethnologue.com/insights/digital-language-divide/">
          Ethnologue
        </LinkButton>
      </>
    ),
    render: (lang) => lang.digitalSupport,
  },
  {
    key: 'CLDR Coverage Level',
    description: (
      <>
        CLDR data is collected in tiers, later tiers include data from the prior tier.{' '}
        <CoverageLevelsExplanation />
      </>
    ),
    render: (lang) => <CLDRCoverageText object={lang} verbosity="coverage level" />,
    exportValue: (lang) => lang.cldrCoverage?.actualCoverageLevel,
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
    render: (lang) => <CLDRCoverageText object={lang} verbosity="count of locales" />,
    exportValue: (lang) => lang.cldrCoverage?.countOfCLDRLocales,
  },
  {
    key: 'ICU Support',
    render: (lang) => <ICUSupportStatus object={lang} />,
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
  },
  {
    key: 'Wikipedia Active Users',
    render: (object) => <WikipediaActiveUsers object={object} />,
  },
];

export const LanguageDigitalSupportColumns: TableColumn<LanguageData>[] = columns.map(
  (col: TableColumn<LanguageData>) => ({
    ...col,
    isInitiallyVisible: false,
    columnGroup: 'Digital Support',
  }),
);
