import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import TableColumn from '@features/table/TableColumn';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';

import { EntityType } from '@entities/types/EntityTypes';
import { EntityCLDRCoverageLevel, EntityCLDRLocaleCount } from '@entities/ui/CLDRCoverageInfo';
import { CoverageLevelsExplanation } from '@entities/ui/CLDRCoverageLevels';
import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import {
  WikipediaActiveUsers,
  WikipediaArticles,
  WikipediaLink,
  WikipediaStatusDisplay,
} from '@entities/ui/EntityWikipediaInfo';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';

import ExternalLink from '@shared/ui/ExternalLink';
import IsSupportedIcon from '@shared/ui/IsSupportedIcon';

import { LanguageData, LanguageSource } from '../LanguageTypes';

import { getLanguageIsSupportedBy } from './computeLanguageDigitalSupportStatus';
import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import { DigitalSupportDimension } from './DigitalSupportTypes';
import LanguageDigitalSupportMetascore from './LanguageDigitalSupportMetascore';
import LanguageUDHRInfo, { LanguageUDHRDescription } from './LanguageUDHRInfo';

const columns: TableColumn<LanguageData>[] = [
  {
    key: 'Overall Digital Support',
    render: (lang) => <LanguageDigitalSupportMetascore lang={lang} />,
    exportValue: (lang) => lang.digitalSupportScore?.overall,
    field: Field.DigitalSupport,
    isInitiallyVisible: (params) => params.languageSource === LanguageSource.CLDR,
  },
  {
    key: 'I18n Frameworks',
    render: (lang) => (
      <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.I18nFrameworks} />
    ),
    exportValue: (lang) => lang.digitalSupportScore?.i18nFrameworks,
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
        <EntityCLDRCoverageLevel ent={lang} />
        <CLDRWarningNotes ent={lang} />
      </>
    ),
    exportValue: (lang) => lang.CLDR.coverage?.actualCoverageLevel,
    isInitiallyVisible: (params) => params.languageSource === LanguageSource.CLDR,
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
    render: (lang) => <EntityCLDRLocaleCount ent={lang} />,
    valueType: TableValueType.Count,
    exportValue: (lang) => lang.CLDR.coverage?.countOfCLDRLocales,
  },
  {
    key: 'ICU Support',
    render: (lang) => <ICUSupportStatus ent={lang} />,
    exportValue: (lang) => {
      if (lang.CLDR.coverage?.inICU !== undefined) return lang.CLDR.coverage.inICU;
      if (lang.CLDR.dataProvider?.type === EntityType.Language)
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
    key: 'Machine Translation',
    render: (lang) => (
      <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.MachineTranslation} />
    ),
    exportValue: (lang) => lang.digitalSupportScore?.machineTranslation,
  },
  {
    key: 'Google Translate',
    description: 'Language entries available in Google Translate.',
    ...getTechSupportColumnRender('GTranslate'),
  },
  {
    key: 'Interface Support',
    render: (lang) => (
      <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.Interfaces} />
    ),
    exportValue: (lang) => lang.digitalSupportScore?.interfaces,
  },
  {
    key: 'Windows 11',
    description:
      'Language pack available in Windows 11 for viewing menus, dialog boxes, and supported apps and websites.',
    ...getTechSupportColumnRender('win11'),
  },
  {
    key: 'Android',
    description: 'Language entries supported in Android.',
    ...getTechSupportColumnRender('Android'),
  },
  {
    key: 'iOS',
    description: 'Language entries supported in iOS.',
    ...getTechSupportColumnRender('iOS'),
  },
  {
    key: 'MacOS',
    description: 'Language entries supported in macOS.',
    ...getTechSupportColumnRender('macOS'),
  },
  {
    key: 'Documentation',
    render: (lang) => (
      <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.Documentation} />
    ),
    exportValue: (lang) => lang.digitalSupportScore?.documentation,
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
    render: (ent) => (
      <>
        <WikipediaStatusDisplay ent={ent} />
        <WikipediaLink ent={ent} />
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
    render: (ent) => <WikipediaArticles ent={ent} />,
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
    render: (ent) => <WikipediaActiveUsers ent={ent} />,
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

function getTechSupportColumnRender(techShortName: string): {
  render: (lang: LanguageData) => React.ReactNode;
  exportValue: (lang: LanguageData) => string;
} {
  return {
    render: (lang) => (
      <IsSupportedIcon isSupported={getLanguageIsSupportedBy(lang, techShortName)} />
    ),
    exportValue: (lang) => {
      const techSupport =
        lang.techSupport?.filter((entry) => entry.techShortName === techShortName) || [];
      if (!techSupport || techSupport.length === 0) return 'n/a';
      return techSupport
        .map((entry) => {
          const extraParts = [];
          if (entry.territory) extraParts.push(entry.territory.nameDisplay);
          if (entry.writingSystem) extraParts.push(entry.writingSystem.nameDisplay);
          if (extraParts.length > 0) return entry.name + ' (' + extraParts.join(', ') + ')';
          return entry.name;
        })
        .join('; ');
    },
  };
}

export const LanguageDigitalSupportColumns: TableColumn<LanguageData>[] = columns.map(
  (col: TableColumn<LanguageData>) => ({
    isInitiallyVisible: false,
    ...col,
    columnGroup: 'Digital Support',
  }),
);
