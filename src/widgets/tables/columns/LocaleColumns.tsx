import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '@entities/language/LanguageFamilyUtils';
import { getCountriesInObject } from '@entities/lib/getObjectRelatedTerritories';
import LocaleNameWithFilters from '@entities/locale/LocaleNameWithFilters';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData } from '@entities/locale/LocaleTypes';
import LocaleFormedHereDisplay from '@entities/locale/localstatus/LocaleFormedHereDisplay';
import LocaleHistoricPresenceDisplay from '@entities/locale/localstatus/LocaleHistoricPresenceDisplay';
import ObjectWikipediaInfo from '@entities/ui/ObjectWikipediaInfo';

import { toSentenceCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/old/CommaSeparated';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import { LocalePopulationColumns } from './LocalePopulationColumns';
import LocaleRelatedLocalesColumns from './LocaleRelatedLocalesColumns';
import LocaleWritingColumns from './LocaleWritingColumns';

function getLocaleColumns(): TableColumn<LocaleData>[] {
  return [
    CodeColumn,
    {
      key: 'Name',
      render: (object) => <LocaleNameWithFilters locale={object} />,
      field: Field.Name,
      columnGroup: 'Names',
    },
    EndonymColumn,
    {
      key: 'Language Names',
      render: (object) => <CommaSeparated>{object.language?.names}</CommaSeparated>,
      columnGroup: 'Names',
      isInitiallyVisible: false,
    },
    ...LocalePopulationColumns,
    ...LocaleWritingColumns,
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
      key: 'Variants',
      render: (object) =>
        object.variants && (
          <CommaSeparated limit={1}>
            {object.variants.map((vt) => (
              <HoverableObjectName object={vt} key={vt.ID} />
            ))}
          </CommaSeparated>
        ),
      field: Field.Variant,
      isInitiallyVisible: false,
      columnGroup: 'Linked Data',
    },
    ...LocaleRelatedLocalesColumns,
    {
      key: 'Macrolanguage',
      render: (loc) =>
        loc.language && <HoverableObjectName object={getLanguageRootMacrolanguage(loc.language)} />,
      isInitiallyVisible: false,
      columnGroup: 'Linked Data',
    },
    {
      key: 'Language Family',
      render: (loc) =>
        loc.language && (
          <HoverableObjectName object={getLanguageRootLanguageFamily(loc.language)} />
        ),
      field: Field.LanguageFamily,
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
      field: Field.GovernmentStatus,
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
  ];
}

export default getLocaleColumns;
