import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { ObjectType } from '@features/params/PageParamTypes';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguageUDHRInfo, {
  LanguageUDHRDescription,
} from '@entities/language/vitality/LanguageUDHRInfo';
import { ObjectCLDRCoverageLevel, ObjectCLDRLocaleCount } from '@entities/ui/CLDRCoverageInfo';
import { CoverageLevelsExplanation } from '@entities/ui/CLDRCoverageLevels';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import GoogleTranslateSupportStatus from '@entities/ui/GoogleTranslateSupportStatus';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';
import {
  WikipediaActiveUsers,
  WikipediaArticles,
  WikipediaLink,
  WikipediaStatusDisplay,
} from '@entities/ui/ObjectWikipediaInfo';

import ExternalLink from '@shared/ui/ExternalLink';

const columns: TableColumn<LanguageData>[] = [
  // {
  //   key: 'Digital Support (Ethnologue)',
  //   description: <LanguageDigitalSupportDescription />,
  //   render: (lang) => <LanguageDigitalSupportCell lang={lang} />,
  //   exportValue: (lang) => getDigitalSupportLabel(lang.Ethnologue.digitalSupport),
  // },
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
    key: 'Keyboards',
    description: 'Number of keyboard layouts available for this language.',
    render: (lang) => <HoverableEnumeration items={lang.keyboards?.map((kb) => kb.nameDisplay)} />,
    field: Field.CountOfKeyboards,
  },
  {
    key: 'Google Translate',
    description: 'Language entries available in Google Translate.',
    render: (lang) => <GoogleTranslateSupportStatus lang={lang} />,
    exportValue: (lang) => {
      if (!lang.googleTranslate || lang.googleTranslate.length === 0) return 'n/a';
      return lang.googleTranslate.map((entry) => entry.name).join('; ');
    },
  },
  {
    key: 'Wikipedia Status',
    description: (
      <>
        Sources:
        <ul style={{ margin: '0' }}>
          <li>
            <ExternalLink href="https://en.wikipedia.org/wiki/List_of_Wikipedias">
              List of Active and Closed Wikipedias
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href="https://incubator.wikimedia.org/wiki/Incubator:Wikis">
              List of test wikis in development on the Wikimedia Incubator
            </ExternalLink>
          </li>
        </ul>
      </>
    ),
    render: (object) => (
      <>
        <WikipediaStatusDisplay object={object} />
        <WikipediaLink object={object} />
      </>
    ),
  },
  {
    key: 'Wikipedia Articles',
    description: (
      <>
        From the{' '}
        <ExternalLink href="https://en.wikipedia.org/wiki/List_of_Wikipedias">
          List of Wikipedias
        </ExternalLink>
      </>
    ),
    render: (object) => <WikipediaArticles object={object} />,
    valueType: TableValueType.Count,
  },
  {
    key: 'Wikipedia Active Users',
    description: (
      <>
        From the{' '}
        <ExternalLink href="https://en.wikipedia.org/wiki/List_of_Wikipedias">
          List of Wikipedias
        </ExternalLink>
      </>
    ),
    render: (object) => <WikipediaActiveUsers object={object} />,
    valueType: TableValueType.Population,
  },
  {
    key: 'Wikipedia Article',
    render: (language) => {
      const isoCode = language?.ISO?.code;
      if (!isoCode) return '';
      return (
        <ExternalLink href={`https://en.wikipedia.org/wiki/ISO_639:${isoCode}`}>
          wikipedia
        </ExternalLink>
      );
    },
    exportValue: (language) => {
      const isoCode = language?.ISO?.code;
      return isoCode ? `https://en.wikipedia.org/wiki/ISO_639:${isoCode}` : '';
    },
  },
  {
    key: 'UDHR Translations',
    description: LanguageUDHRDescription,
    render: (lang) => <LanguageUDHRInfo lang={lang} size="short" />,
    exportValue: (lang) =>
      lang.udhr ? lang.udhr.map((udhrEntry) => udhrEntry.name).join('; ') : 'None',
  },
];
export const LanguageDigitalSupportColumns: TableColumn<LanguageData>[] = columns.map(
  (col: TableColumn<LanguageData>) => ({
    ...col,
    isInitiallyVisible: false,
    columnGroup: 'Digital Support',
  }),
);
