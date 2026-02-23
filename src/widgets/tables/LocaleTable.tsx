import React from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import usePageParams from '@features/params/usePageParams';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '@entities/language/LanguageFamilyUtils';
import { getCountriesInObject } from '@entities/lib/getObjectRelatedTerritories';
import LocaleNameWithFilters from '@entities/locale/LocaleNameWithFilters';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData } from '@entities/locale/LocaleTypes';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import { toSentenceCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import LocaleFormedHereDisplay from '@entities/locale/localstatus/LocaleFormedHereDisplay';
import LocaleHistoricPresenceDisplay from '@entities/locale/localstatus/LocaleHistoricPresenceDisplay';
import { LocalePopulationColumns } from './columns/LocalePopulationColumns';
import LocaleRelatedLocalesColumns from './columns/LocaleRelatedLocalesColumns';

const LocaleTable: React.FC = () => {
  const { locales } = useDataContext();
  const { languageSource } = usePageParams();

  return (
    <InteractiveObjectTable<LocaleData>
      tableID={TableID.Locales}
      objects={locales.filter((locale) => locale.language?.[languageSource].code != null)}
      columns={[
        CodeColumn,
        {
          key: 'Name',
          render: (object) => <LocaleNameWithFilters locale={object} />,
          field: Field.Name,
          columnGroup: 'Names',
        },
        EndonymColumn,
        ...LocalePopulationColumns,
        {
          key: 'Literacy',
          render: (object) => object.literacyPercent,
          isInitiallyVisible: false,
          field: Field.Literacy,
          columnGroup: 'Writing',
        },
        {
          key: 'Writing System (specified)',
          description: (
            <>
              Some locales specify a writing system, for instance{' '}
              <code>
                zh_<strong>Hant</strong>_TW
              </code>{' '}
              means it specifically refers to Traditional Han characters.
            </>
          ),
          render: (object) => <HoverableObjectName object={object.writingSystem} />,
          isInitiallyVisible: false,
          columnGroup: 'Writing',
        },
        {
          key: 'Writing System (inferred)',
          description: (
            <>
              Some locales do not include a writing system but it can usually be inferred based on
              the primary writing system for the language. For instance, <code>zh_CN</code> could be
              written in <code>Hant</code> or <code>Hans</code> writing. Since the primary writing
              system in China is the Simplified characters, it can be inferred to be{' '}
              <code>Hans</code>.
            </>
          ),
          render: (object) => (
            <HoverableObjectName
              object={object.writingSystem ?? object.language?.primaryWritingSystem}
            />
          ),
          isInitiallyVisible: false,
          field: Field.WritingSystem,
          columnGroup: 'Writing',
        },
        {
          key: 'Language',
          render: (object) => <HoverableObjectName object={object.language} />,
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
          field: Field.Language,
        },
        {
          key: 'Language Scope',
          render: (object) => getLanguageScopeLabel(object.language?.scope),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
          field: Field.LanguageScope,
        },
        {
          key: 'Territory',
          render: (object) => <HoverableObjectName object={object.territory} />,
          isInitiallyVisible: false,
          field: Field.Territory,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Territory Scope',
          render: (object) => getTerritoryScopeLabel(object.territory?.scope),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
          field: Field.TerritoryScope,
        },
        {
          key: 'Countries',
          render: (object) => (
            <HoverableEnumeration items={getCountriesInObject(object)?.map((t) => t.nameDisplay)} />
          ),
          isInitiallyVisible: false,
          field: Field.CountOfCountries,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Variant Tags',
          render: (object) =>
            object.variantTags && (
              <CommaSeparated limit={1}>
                {object.variantTags.map((vt) => (
                  <HoverableObjectName object={vt} key={vt.ID} />
                ))}
              </CommaSeparated>
            ),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        ...LocaleRelatedLocalesColumns,
        {
          key: 'Macrolanguage',
          render: (loc) =>
            loc.language && (
              <HoverableObjectName object={getLanguageRootMacrolanguage(loc.language)} />
            ),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Language Family',
          render: (loc) =>
            loc.language && (
              <HoverableObjectName object={getLanguageRootLanguageFamily(loc.language)} />
            ),
          isInitiallyVisible: false,
          columnGroup: 'Linked Data',
        },
        {
          key: 'Official Status',
          render: (loc) =>
            loc.officialStatus ? (
              getOfficialLabel(loc.officialStatus)
            ) : (
              <Deemphasized>None</Deemphasized>
            ),
          columnGroup: 'Local Status',
        },
        {
          key: 'Formation',
          render: (loc) => <LocaleFormedHereDisplay loc={loc} />,
          field: Field.LanguageFormedHere,
          isInitiallyVisible: false,
          columnGroup: 'Local Status',
        },
        {
          key: 'Historic Presence',
          render: (loc) => <LocaleHistoricPresenceDisplay loc={loc} />,
          field: Field.HistoricPresence,
          isInitiallyVisible: false,
          columnGroup: 'Local Status',
        },
        {
          key: 'Wikipedia',
          render: (object) => <ObjectWikipediaInfo object={object} />,
          isInitiallyVisible: false,
        },
        {
          key: 'Locale Source',
          render: (object) => toSentenceCase(object.localeSource),
          isInitiallyVisible: false,
        },
      ]}
    />
  );
};

export default LocaleTable;
