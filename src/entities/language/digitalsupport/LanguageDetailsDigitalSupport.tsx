import React, { useMemo } from 'react';

import DetailsSection from '@widgets/details/ui/DetailsSection';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import Field from '@features/transforms/fields/Field';
import useFilters from '@features/transforms/filtering/useFilters';
import { useSortFunction } from '@features/transforms/sorting/sort';

import { numberToSigFigs } from '@shared/lib/numberUtils';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

import { getDigitalSupportDimensionLabel } from '@strings/DigitalSupportStrings';

import type { LanguageData } from '../LanguageTypes';

import {
  DIGITAL_SUPPORT_CATEGORIES,
  getDigitalSupportStatus,
} from './computeLanguageDigitalSupportStatus';
import DigitalSupportCategoryRow from './DigitalSupportCategoryRow';
import DigitalSupportDimensionBreakdown from './DigitalSupportDimensionBreakdown';
import LanguageDigitalSupportMeter from './DigitalSupportMeter';
import DigitalSupportStatusIcon from './DigitalSupportStatusIcon';
import { DigitalSupportDimension } from './DigitalSupportTypes';

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

function Locales({ lang }: { lang: LanguageData }) {
  const sortFunction = useSortFunction();
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
