import React, { useMemo } from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';

import CLDRWarningNotes from '@entities/ui/CLDRWarningNotes';
import ICUSupportStatus from '@entities/ui/ICUSupportStatus';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';
import { numberToSigFigs } from '@shared/lib/numberUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';
import LinkButton from '@shared/ui/LinkButton';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import { EntityCLDRCoverageLevel, EntityCLDRLocaleCount } from '../../ui/CLDRCoverageInfo';
import EntityWikipediaInfo from '../../ui/EntityWikipediaInfo';
import { LanguageData } from '../LanguageTypes';

import {
  DIGITAL_SUPPORT_CATEGORIES,
  getDigitalSupportStatus,
  getDigitalSupportStatusSeverity,
  getInterfacePlatforms,
} from './computeLanguageDigitalSupportStatus';
import DigitalSupportCategoryRow from './DigitalSupportCategoryRow';
import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import DigitalSupportStatusIcon from './DigitalSupportStatusIcon';
import { DigitalSupportCategory, DigitalSupportDimension } from './DigitalSupportTypes';
import LanguageUDHRInfo, { LanguageUDHRDescription } from './LanguageUDHRInfo';

type Props = { lang: LanguageData };

type SectionView = 'support' | 'locales';

const LanguageDetailsDigitalSupport: React.FC<Props> = ({ lang }) => {
  const { digitalSupportScore } = lang;
  const [sectionView, setSectionView] = React.useState<SectionView>('support');
  // Show the missing capabilities first, keeping the usual dimension order within a status
  const categories = useMemo(
    () =>
      DIGITAL_SUPPORT_CATEGORIES.map((dimension) => ({
        dimension,
        summary: getDigitalSupportStatus(lang, dimension),
      })).sort(
        (a, b) =>
          getDigitalSupportStatusSeverity(a.summary.status) -
          getDigitalSupportStatusSeverity(b.summary.status),
      ),
    [lang],
  );

  if (!digitalSupportScore) return null; // Withhold the section

  return (
    <DetailsSection
      startCollapsed={true}
      title="Digital Support"
      score={numberToSigFigs(digitalSupportScore.overall, 2) + '/10'}
      headerOptions={
        <Tabs value={sectionView} onValueChange={setSectionView}>
          <TabsList>
            {['support', 'locales'].map((v) => (
              <TabsTrigger key={v} value={v} className="cursor-pointer">
                {v === 'support' ? 'Support' : 'Locales'}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      {sectionView === 'locales' && <Locales lang={lang} />}
      {sectionView === 'support' && (
        <>
          <DigitalSupportOverview lang={lang} />
          <ul className="flex flex-col">
            {categories.map(({ dimension, summary }) => (
              <DigitalSupportCategoryRow
                key={dimension}
                summary={summary}
                title={getDigitalSupportDimensionLabel(dimension)}
              >
                <DigitalSupportDimensionBreakdown lang={lang} dimension={dimension} />
              </DigitalSupportCategoryRow>
            ))}
          </ul>
        </>
      )}
    </DetailsSection>
  );
};

const DigitalSupportOverview: React.FC<Props> = ({ lang }) => {
  const summary = getDigitalSupportStatus(lang, DigitalSupportDimension.Overall);

  return (
    <div className="flex flex-row flex-wrap items-center gap-2 px-2 pb-2 text-sm">
      <DigitalSupportStatusIcon status={summary.status} />
      <span className="flex-1 min-w-0">{summary.label}</span>
      <div className="max-w-40 grow">
        <LanguageDigitalSupportMeter lang={lang} dim={DigitalSupportDimension.Overall} />
      </div>
    </div>
  );
};

type DimProps = { lang: LanguageData; dimension: DigitalSupportCategory };

const DigitalSupportDimensionBreakdown: React.FC<DimProps> = ({ lang, dimension }) => {
  switch (dimension) {
    case DigitalSupportDimension.Keyboards:
      return lang.keyboards?.length ? (
        <CommaSeparated>
          {lang.keyboards.map((keyboard) => (
            <HoverableEntityName key={keyboard.ID} ent={keyboard} />
          ))}
        </CommaSeparated>
      ) : (
        'No known keyboards are available on Keyman or GBoard'
      );
    case DigitalSupportDimension.Documentation:
      return (
        <>
          <DetailsField
            title="Wikipedia"
            endContent={
              lang.wikipedias &&
              lang.wikipedias.length > 0 && (
                <LinkButton href={lang.wikipedias[0].url}>{lang.wikipedias[0].url}</LinkButton>
              )
            }
          >
            <EntityWikipediaInfo ent={lang} />
          </DetailsField>
          <DetailsField title="UDHR" description={LanguageUDHRDescription}>
            <LanguageUDHRInfo lang={lang} size="long" />
          </DetailsField>
        </>
      );
    case DigitalSupportDimension.I18nFrameworks:
      return (
        <>
          <DetailsField title="CLDR Coverage">
            <div style={{ display: 'inline-flex', flexDirection: 'row', gap: '0.5em' }}>
              <CLDRWarningNotes ent={lang} />
              <EntityCLDRCoverageLevel ent={lang} />
              <EntityCLDRLocaleCount ent={lang} verbose={true} />
            </div>
          </DetailsField>
          <DetailsField title="ICU Support">
            <ICUSupportStatus ent={lang} />
          </DetailsField>
        </>
      );
    case DigitalSupportDimension.MachineTranslation:
      return (
        <DetailsField title="Google Translate">
          {lang.googleTranslate?.length ? (
            lang.googleTranslate.length +
            ' language pack' +
            (lang.googleTranslate.length > 1 ? 's' : '')
          ) : (
            <Deemphasized>Not available</Deemphasized>
          )}
        </DetailsField>
      );
    case DigitalSupportDimension.Interfaces:
      return (
        <>
          {getInterfacePlatforms(lang).map(({ label, entries }) => (
            <DetailsField key={label} title={label}>
              {entries.length > 0 ? (
                `${entries.length} language pack${entries.length > 1 ? 's' : ''}`
              ) : (
                <Deemphasized>Not available</Deemphasized>
              )}
            </DetailsField>
          ))}
        </>
      );
    default:
      enforceExhaustiveSwitch(dimension);
  }
};

function Locales({ lang }: { lang: LanguageData }) {
  const sortFunction = getSortFunction();
  const filterByScope = useFilters()[Field.TerritoryScope];
  const locales = useMemo(
    () => (lang.locales ?? []).filter(filterByScope).sort(sortFunction),
    [lang.locales, filterByScope, sortFunction],
  );

  return (
    <div className="@container text-xs">
      {/* 3x3 grid with max height and scrollable */}
      <div className="grid grid-cols-3 gap-3 p-2.5 max-h-64 overflow-y-auto">
        {locales.map((locale) => (
          <div key={locale.ID}>
            {/* to match the design doc */}
            <code>{locale.codeDisplay}</code>{' '}
            <HoverableEntityName ent={locale} labelSource="locale without language" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LanguageDetailsDigitalSupport;
