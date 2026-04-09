import { CopyIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import Selector from '@features/params/ui/Selector';
import { SelectorDisplay } from '@features/params/ui/SelectorDisplayContext';
import SelectorLabel from '@features/params/ui/SelectorLabel';
import usePageParams from '@features/params/usePageParams';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';
import { getScopeFilter } from '@features/transforms/filtering/filter';
import { getSortFunction } from '@features/transforms/sorting/sort';

import { CensusCollectorType } from '@entities/census/CensusTypes';
import LocaleCensusCitation from '@entities/locale/LocaleCensusCitation';
import { LocaleData, PopulationSourceCategory } from '@entities/locale/LocaleTypes';
import { usePotentialLocaleThreshold } from '@entities/locale/PotentialLocaleThreshold';
import usePotentialLocales from '@entities/locale/usePotentialLocales';

import CollapsibleReport from '@shared/containers/CollapsibleReport';

const ReportLocalesPotential: React.FC = () => {
  const { percentThreshold: minInCountry, percentThresholdSelector: minInCountrySelector } =
    usePotentialLocaleThreshold(
      <SelectorLabel
        label="% in Country:"
        description="Limit results by the minimum percent population in a territory that uses the language."
      />,
    );
  const [requireBothPercents, setRequireBothPercents] = React.useState(true);
  const {
    percentThreshold: minOfLangWorldWide,
    percentThresholdSelector: minOfLangWorldWideSelector,
  } = usePotentialLocaleThreshold(
    <SelectorLabel
      label="% of Lang Worldwide:"
      description="Limit results by the minimum percent population of the language compared worldwide."
    />,
  );
  const isPercentEnough = useCallback(
    (percInCountry: number | undefined, percOfLangWorldWide: number | undefined) => {
      if (requireBothPercents) {
        return (
          (percInCountry ?? 0) >= minInCountry && (percOfLangWorldWide ?? 0) >= minOfLangWorldWide
        );
      } else {
        return (
          (percInCountry ?? 0) >= minInCountry || (percOfLangWorldWide ?? 0) >= minOfLangWorldWide
        );
      }
    },
    [minInCountry, minOfLangWorldWide, requireBothPercents],
  );
  const potentialLocales = usePotentialLocales(isPercentEnough);

  return (
    <div>
      <h1>Potential Locales</h1>
      <p>
        This page lists locales from Census data that are not in the list of defined locales. There
        are too many possible combinations of language + territory + variation information, so the
        number of actualized locales is smaller than the possible ones. However ones that appear
        here may be worth considering.
      </p>
      Filter by minimum:
      <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'start' }}>
        {minInCountrySelector}
        <Selector<number>
          options={[0, 1]}
          onChange={(value) => setRequireBothPercents(value === 1)}
          display={SelectorDisplay.ButtonGroup}
          selected={requireBothPercents ? 1 : 0}
          getOptionLabel={(v) => (v ? 'and' : 'or')}
        />
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
    </div>
  );
};

const SubReport: React.FC<{
  children: React.ReactNode;
  locales: LocaleData[];
  title: string;
}> = ({ title, children, locales }) => {
  const filterByScope = getScopeFilter();
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
    <InteractiveObjectTable<LocaleData>
      tableID={TableID.PotentialLocales}
      objects={locales}
      columns={[
        {
          key: 'Potential Locale',
          render: (object) => <HoverableObjectName object={object} labelSource="code" />,
          field: Field.Code,
        },
        {
          key: 'Language',
          render: (object) =>
            object.language ? (
              <HoverableObjectName object={object.language} />
            ) : (
              object.languageCode
            ),
          field: Field.Name,
        },
        {
          key: 'Population (Adjusted)',
          render: (object) => object.populationAdjusted,
          field: Field.Population,
        },
        {
          key: 'Population (in Census)',
          render: (object) => object.populationSpeaking,
          field: Field.PopulationDirectlySourced,
          isInitiallyVisible: false,
        },
        {
          key: '% in Territory',
          render: (object) => object.populationSpeakingPercent,
          field: Field.PercentOfTerritoryPopulation,
        },
        {
          key: '% of Global Language Speakers',
          render: (object) =>
            object.populationAdjusted &&
            (object.populationAdjusted * 100) / (object.language?.populationEstimate ?? 1),
          field: Field.PercentOfOverallLanguageSpeakers,
        },
        {
          key: 'Population Source',
          render: (object) => <LocaleCensusCitation locale={object} size="short" />,
        },
        {
          key: 'Related Locale',
          render: (object) => (
            <HoverableObjectName
              object={object.relatedLocales?.childLanguages?.[0]}
              labelSource="code"
            />
          ),
        },
        {
          key: 'Copy',
          render: (object) => (
            <button
              style={{ padding: '0.25em' }}
              onClick={() => navigator.clipboard.writeText(getLocaleExportString(object))}
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
  if (locale.populationCensus?.collectorType === CensusCollectorType.Government) {
    populationSource = PopulationSourceCategory.Official;
  } else if (locale.populationCensus?.collectorType === CensusCollectorType.Study) {
    populationSource = PopulationSourceCategory.Study;
  }
  return `${locale.ID}\t${locale.nameDisplay} (${locale.territory?.nameDisplay})\t\t${populationSource}\t${locale.populationSpeaking}\t${locale.officialStatus ?? ''}\n`;
}

export default ReportLocalesPotential;
