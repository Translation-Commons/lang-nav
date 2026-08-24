import { InfoIcon } from 'lucide-react';
import React, { useCallback } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEntity from '@features/layers/hovercard/HoverableEntity';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import { EntityType, SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import { CodeColumn } from '@features/table/CommonColumns';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import TableValueType from '@features/table/TableValueType';
import Field from '@features/transforms/fields/Field';
import EntityFieldHighlightedByPageSearch from '@features/transforms/search/EntityFieldHighlightedByPageSearch';
import { sortByPopulation } from '@features/transforms/sorting/sort';

import { CensusData } from '@entities/census/CensusTypes';
import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '@entities/language/LanguageFamilyUtils';
import { LocaleData } from '@entities/locale/LocaleTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import Deemphasized from '@shared/ui/Deemphasized';
import { PercentageDifference } from '@shared/ui/PercentageDifference';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

type Props = {
  census: CensusData;
};

const TableOfLanguagesInCensus: React.FC<Props> = ({ census }) => {
  const { getLanguage, getLocale } = useDataContext();
  const { localeSeparator } = usePageParams();

  const langsNotFound: string[] = [];

  // Create new locale data ents based on the census results
  const languagesInCensus: LocaleData[] = Object.entries(census.languageEstimates)
    .map(([langID, populationSpeaking]) => {
      const lang = getLanguage(langID);
      if (lang == null) {
        langsNotFound.push(langID);
        return null;
      }
      const percent =
        (populationSpeaking * 100) / (census.populationWithPositiveResponses || census.population);
      return {
        type: EntityType.Locale,
        ID: langID + '_' + census.isoRegionCode,
        codeDisplay: lang.codeDisplay + localeSeparator + census.isoRegionCode,
        languageCode: langID,
        language: lang,
        nameDisplay: lang.nameDisplay,
        names: lang.names,

        territory: census.territory,
        territoryCode: census.isoRegionCode,

        pop: {
          speaking: {
            adjusted: populationSpeaking,
            percent,
            unadjusted: populationSpeaking,
            census,
          },
          writing: {}, // storing values under speaking for simplicity -- regardless of the census type
        },
      } as LocaleData;
    })
    .filter((loc) => loc != null);

  const getActualLocaleInfoButton = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <ActualLocaleInfoButton actualLocale={getLocale(mockedLocale.ID)} />
    ),
    [getLocale],
  );

  const getPopulationDifference = useCallback(
    (mockedLocale: LocaleData): React.ReactNode => (
      <PercentageDifference
        percentNew={mockedLocale.pop.speaking.percent || 0}
        percentOld={getLocale(mockedLocale.ID)?.pop.speaking.percent}
      />
    ),
    [getLocale],
  );

  return (
    <div>
      {langsNotFound.length > 0 && (
        <div>
          <label>Languages not found in the database:</label>
          {langsNotFound.join(', ')}
        </div>
      )}
      <InteractiveEntityTable
        tableID={TableID.LanguagesInCensus}
        ents={languagesInCensus}
        shouldFilterUsingSearchBar={false}
        columns={[
          CodeColumn,
          {
            key: 'Languages',
            render: (ent) => (
              <HoverableEntity ent={ent.language}>
                <EntityFieldHighlightedByPageSearch ent={ent} field={SearchableField.NameDisplay} />
              </HoverableEntity>
            ),
            field: Field.Name,
          },
          {
            key: 'Population',
            render: (loc) => loc.pop.speaking.adjusted,
            field: Field.Population,
          },
          {
            key: 'Percent Within Territory',
            render: (loc) => loc.pop.speaking.percent,
            field: Field.PercentOfTerritoryPopulation,
          },
          {
            key: 'Scope',
            render: (loc) => getLanguageScopeLabel(loc.language?.scope),
            isInitiallyVisible: false,
            field: Field.LanguageScope,
          },
          {
            key: 'Locale Entry',
            description: (
              <>
                The locale dataset has a canonical population estimate and may refer to estimates
                from multiple censuses. Hover for the canonical locale entry or click to see more
                details. The locale dataset does not contain every combination of language +
                territory so some may not be found.
              </>
            ),
            render: getActualLocaleInfoButton,
          },
          {
            key: 'Population Difference',
            description: (
              <>
                The difference the population estimate in this census is compared to the canonical
                locale population estimate. This compares percentages, so 8.3% - 10.4% is -2.1 pp
                (percentage points). Values are colored if the difference is more than 10%.
              </>
            ),
            render: getPopulationDifference,
            valueType: TableValueType.Decimal,
          },
          {
            key: 'Percent of Worldwide in Language',
            render: (ent) =>
              ent.pop.speaking.adjusted &&
              (ent.pop.speaking.adjusted * 100) / (ent.language?.pop.overall || 1),
            isInitiallyVisible: false,
            field: Field.PercentOfOverallLanguageSpeakers,
          },
          {
            key: 'Macrolanguage',
            render: (loc) =>
              loc.language && (
                <HoverableEntityName ent={getLanguageRootMacrolanguage(loc.language)} />
              ),
            isInitiallyVisible: false,
          },
          {
            key: 'Language Family',
            render: (loc) =>
              loc.language && (
                <HoverableEntityName ent={getLanguageRootLanguageFamily(loc.language)} />
              ),
            field: Field.LanguageFamily,
            isInitiallyVisible: false,
          },
          {
            key: 'Primary Country',
            render: (loc) => {
              const territory = loc.language?.locales
                .filter((l) => l.territory?.scope === TerritoryScope.Country)
                .sort(sortByPopulation)[0]?.territory;
              return territory ? <HoverableEntityName ent={territory} /> : null;
            },
            isInitiallyVisible: true,
          },
        ]}
      />
    </div>
  );
};

const ActualLocaleInfoButton: React.FC<{ actualLocale?: LocaleData }> = ({ actualLocale }) => {
  if (actualLocale == null) {
    return (
      <Deemphasized>
        <span style={{ fontSize: '0.8em' }}>not found</span>
      </Deemphasized>
    );
  }
  return (
    <HoverableEntity ent={actualLocale} style={{ verticalAlign: 'middle' }}>
      <InfoIcon size="1em" display="block" />
    </HoverableEntity>
  );
};

export default TableOfLanguagesInCensus;
