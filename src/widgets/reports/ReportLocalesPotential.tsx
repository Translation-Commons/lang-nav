import { CopyIcon } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import usePageParams from '@features/params/usePageParams';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';
import { useScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';
import { usePotentialLocaleThreshold } from '@entities/locale/PotentialLocaleThreshold';
import usePotentialLocales from '@entities/locale/usePotentialLocales';
import PopulationFocus from '@entities/types/PopulationFocus';

import CollapsibleReport from '@shared/containers/CollapsibleReport';
import { Tabs, TabsList, TabsTrigger } from '@shared/ui/tabs';

const ReportLocalesPotential: React.FC = () => {
  const { percentThreshold: minInCountry, percentThresholdSelector: minInCountrySelector } =
    usePotentialLocaleThreshold(
      '% in Country:',
      'Limit results by the minimum percent population in a territory that uses the language.',
    );
  const [requireBothPercents, setRequireBothPercents] = React.useState(false);
  const {
    percentThreshold: minOfLangWorldWide,
    percentThresholdSelector: minOfLangWorldWideSelector,
  } = usePotentialLocaleThreshold(
    '% of Lang Worldwide:',
    'Limit results by the minimum percent population of the language compared worldwide.',
  );
  const isPercentEnough = useCallback(
    (percInCountry: number | undefined, percOfLangWorldWide: number | undefined) => {
      const enoughInCountry = (percInCountry ?? 0) >= minInCountry;
      const enoughOfLangWorldWide = (percOfLangWorldWide ?? 0) >= minOfLangWorldWide;
      if (requireBothPercents) return enoughInCountry && enoughOfLangWorldWide;
      return enoughInCountry || enoughOfLangWorldWide;
    },
    [minInCountry, minOfLangWorldWide, requireBothPercents],
  );
  const potentialLocales = usePotentialLocales(isPercentEnough);
  const { locales } = useDataContext();
  const localesMissingOriginalPopData = useMemo(
    () =>
      locales.filter(
        (locale) => (locale.pop.rough ?? 0) <= 10 && (locale.pop.speaking.unadjusted ?? 0) > 10,
      ),
    [locales],
  );

  return (
    <div>
      <p>
        This page lists locales from Census data that are not in the list of defined locales. There
        are too many possible combinations of language + territory + variation information, so the
        number of actualized locales is smaller than the possible ones. However ones that appear
        here may be worth considering.
      </p>
      Filter by minimum:
      <div className="flex flex-wrap gap-2 items-center p-4 text-sm">
        {minInCountrySelector}
        <Tabs
          value={requireBothPercents ? '1' : '0'}
          onValueChange={(value) => setRequireBothPercents(value === '1')}
        >
          <TabsList>
            <TabsTrigger value="1">and</TabsTrigger>
            <TabsTrigger value="0">or</TabsTrigger>
          </TabsList>
        </Tabs>
        {minOfLangWorldWideSelector}
      </div>
      <SubReport title="Largest Populations" locales={potentialLocales.largest}>
        Of all of the census records collected so far, these locales have more people speaking it
        than the other instantiated locales. This likely means the world population is indigenous to
        this country. However, since we do not have full census coverage it is very possible that
        the language is native to a different country without an inputted census record.
        Additionally, some of these locales are macrolanguages or constituents thereof, so we may
        actually have the language but represented by a different aspect.
      </SubReport>
      <SubReport
        title="Largest ** with caveats"
        locales={potentialLocales.largestButDescendantExists}
      >
        The locales represent the largest population of a language in a territory, but a language or
        dialect of that locale is already present for that locale, so it may not be necessary or it
        may be a language family not consistently listed in other censuses.
        <div style={{ height: '0.5em' }} />
        For example, the Canadian [CA] census includes Indo-European [ine] as an entry. Since few
        censuses include Indo-European, it looks as if ine_CA is native to Canada. That is a data
        coverage issue -- not a real origin for the language group. Indo-European contains other
        languages that are listed in other parts of the same census like Italian eng_CA.
      </SubReport>
      <SubReport title="Significant Population" locales={potentialLocales.significant}>
        This is the list of locales native to other countries, but with a significant population in
        other countries.
      </SubReport>
      <SubReport
        title="Significant ** with caveats"
        locales={potentialLocales.significantButMaybeRedundant}
      >
        Locales in this table reflect languages that already have other locales in territories but a
        consistent of the same language not necessarily the same locale. For example, they may have
        an entry with a writing system specified.
      </SubReport>
      <SubReport title="Locales missing pop data in table" locales={localesMissingOriginalPopData}>
        The database stores locale data and based on the initial data does some changes to make
        computed data like regional locales. That relies on having rough estimates before censuses
        are loaded and these locales are missing them in the original locale declaration.
      </SubReport>
    </div>
  );
};

const SubReport: React.FC<{
  children: React.ReactNode;
  locales: LocaleData[];
  title: string;
}> = ({ title, children, locales }) => {
  const filterByScope = useScopeFilter();
  const sortFunction = getSortFunction();
  const { limit, page } = usePageParams();
  const exportLocales = locales
    .filter(filterByScope)
    .sort(sortFunction)
    .slice(limit * (page - 1), Math.min(limit * page, locales.length))
    .map(getLocaleExportString)
    .join('');

  return (
    <CollapsibleReport title={`${title} (${locales.filter(filterByScope).length})`}>
      {children}{' '}
      <button
        style={{ padding: '0.25em' }}
        onClick={() => {
          navigator.clipboard.writeText(exportLocales);
        }}
      >
        Copy visible locales to Clipboard
      </button>
      <PotentialLocalesTable locales={locales} />
    </CollapsibleReport>
  );
};

const PotentialLocalesTable: React.FC<{
  locales: LocaleData[];
  showRelatedLocales?: boolean;
}> = ({ locales }) => {
  return (
    <InteractiveEntityTable<LocaleData>
      tableID={TableID.PotentialLocales}
      ents={locales}
      columns={[
        {
          key: 'Potential Locale',
          render: (ent) => <HoverableEntityName ent={ent} labelSource="code" />,
          field: Field.Code,
        },
        {
          key: 'Language',
          render: (ent) =>
            ent.language ? <HoverableEntityName ent={ent.language} /> : ent.languageCode,
          field: Field.Name,
        },
        {
          key: 'Population (Adjusted)',
          render: (ent) => ent.pop.speaking.adjusted, // All pop numbers are saved in the "speaking" field for potential locales
          field: Field.Population,
        },
        {
          key: 'Population (in Census)',
          render: (ent) => ent.pop.speaking.unadjusted,
          field: Field.PopulationDirectlySourced,
          isInitiallyVisible: false,
        },
        {
          key: '% in Territory',
          render: (ent) => ent.pop.speaking.percent,
          field: Field.PercentOfTerritoryPopulation,
        },
        {
          key: '% of Global Language Speakers',
          render: (ent) =>
            ent.pop.speaking.adjusted &&
            (ent.pop.speaking.adjusted * 100) / (ent.language?.pop.overall ?? 1),
          field: Field.PercentOfOverallLanguageSpeakers,
        },
        {
          key: 'Population Source',
          render: (ent) => <LocaleCensusCitation locale={ent} focus={PopulationFocus.Speaking} />,
        },
        {
          key: 'Related Locale',
          render: (ent) => (
            <HoverableEntityName ent={ent.relatedLocales?.childLanguages?.[0]} labelSource="code" />
          ),
        },
        {
          key: 'Copy',
          render: (ent) => (
            <button
              style={{ padding: '0.25em' }}
              onClick={() => navigator.clipboard.writeText(getLocaleExportString(ent))}
            >
              <CopyIcon size="1em" display="block" />
            </button>
          ),
        },
      ]}
    />
  );
};

function getLocaleExportString(locale: LocaleData): string {
  let populationSource = '';
  let name = locale.nameDisplay;
  if (!name.includes('(')) name += ` (${locale.territory?.nameDisplay})`;
  if (locale.pop.speaking.census?.collectorType === CensusCollectorType.Government) {
    populationSource = PopulationSourceCategory.Official;
  } else if (locale.pop.speaking.census?.collectorType === CensusCollectorType.Study) {
    populationSource = PopulationSourceCategory.Study;
  }
  return `${locale.ID}\t${name}\t\t${populationSource}\t${locale.pop.speaking.unadjusted}\t${locale.officialStatus ?? ''}\n`;
}

export default ReportLocalesPotential;
