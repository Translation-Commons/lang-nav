import React, { useMemo } from 'react';

import DetailsField from '@widgets/details/ui/DetailsField';
import DetailsSection from '@widgets/details/ui/DetailsSection';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { TechScope } from '@entities/tech/TechnologyTypes';
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
import type { LanguageData } from '../LanguageTypes';

import {
  DIGITAL_SUPPORT_CATEGORIES,
  getDigitalSupportStatus,
  getTechsForLanguage,
} from './computeLanguageDigitalSupportStatus';
import DigitalSupportCategoryRow from './DigitalSupportCategoryRow';
import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import DigitalSupportStatusIcon from './DigitalSupportStatusIcon';
import {
  DigitalSupportCategory,
  DigitalSupportDimension,
  getTechScopeForSupportDim,
} from './DigitalSupportTypes';
import LanguageUDHRInfo, { LanguageUDHRDescription } from './LanguageUDHRInfo';

type Props = { lang: LanguageData };

type SectionView = 'support' | 'locales';

const LanguageDetailsDigitalSupport: React.FC<Props> = ({ lang }) => {
  const { digitalSupportScore } = lang;
  const [sectionView, setSectionView] = React.useState<SectionView>('support');

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
            {DIGITAL_SUPPORT_CATEGORIES.map((dimension) => (
              <DigitalSupportCategoryRow
                key={dimension}
                summary={getDigitalSupportStatus(lang, dimension)}
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
  const { getTechnology } = useDataContext();
  const TechName = ({ shortName }: { shortName: string }) => {
    const tech = getTechnology(shortName);
    if (!tech) return shortName;
    return <HoverableEntityName ent={getTechnology(shortName)} />;
  };

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
            <div className="inline-block">
              <LanguageUDHRInfo lang={lang} size="long" />
            </div>
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
            <div className="inline-block align-middle">
              <ICUSupportStatus ent={lang} />
            </div>
          </DetailsField>
        </>
      );
    case DigitalSupportDimension.MachineTranslation:
    case DigitalSupportDimension.AI:
      return getTechsForLanguage(lang, getTechScopeForSupportDim(dimension)).map(
        ({ techShortName, entries }) => (
          <DetailsField key={techShortName} title={<TechName shortName={techShortName} />}>
            {entries.length > 0 ? 'Available' : <Deemphasized>Not available</Deemphasized>}
          </DetailsField>
        ),
      );
    case DigitalSupportDimension.Interfaces:
      return getTechsForLanguage(lang, TechScope.OperatingSystem).map(
        ({ techShortName, entries }) => (
          <DetailsField key={techShortName} title={<TechName shortName={techShortName} />}>
            {entries.length > 0 ? (
              `${entries.length} language pack${entries.length > 1 ? 's' : ''}`
            ) : (
              <Deemphasized>Not available</Deemphasized>
            )}
          </DetailsField>
        ),
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
