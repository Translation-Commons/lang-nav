import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import HoverableEnumeration from '@features/layers/hovercard/HoverableEnumeration';
import { CodeColumn, EndonymColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '@entities/language/LanguageFamilyUtils';
import { getCountriesInEntity } from '@entities/lib/getEntityRelatedTerritories';
import LocaleNameWithFilters from '@entities/locale/LocaleNameWithFilters';
import { getOfficialLabel } from '@entities/locale/LocaleStrings';
import { LocaleData } from '@entities/locale/LocaleTypes';
import LocaleFormedHereDisplay from '@entities/locale/localstatus/LocaleFormedHereDisplay';
import LocaleHistoricPresenceDisplay from '@entities/locale/localstatus/LocaleHistoricPresenceDisplay';
import EntityWikipediaInfo from '@entities/ui/EntityWikipediaInfo';

import { toSentenceCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';
import Deemphasized from '@shared/ui/Deemphasized';

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
      render: (ent) => <LocaleNameWithFilters locale={ent} />,
      field: Field.Name,
      columnGroup: 'Names',
    },
    EndonymColumn,
    {
      key: 'Language Names',
      render: (ent) => <CommaSeparated>{ent.language?.names}</CommaSeparated>,
      columnGroup: 'Names',
      isInitiallyVisible: false,
    },
    ...LocalePopulationColumns,
    ...LocaleWritingColumns,
    {
      key: 'Language',
      render: (ent) => <HoverableEntityName ent={ent.language} />,
      isInitiallyVisible: false,
      columnGroup: 'Linked Data',
      field: Field.Language,
    },
    {
      key: 'Language Scope',
      render: (ent) => getLanguageScopeLabel(ent.language?.scope),
      isInitiallyVisible: false,
      columnGroup: 'Linked Data',
      field: Field.LanguageScope,
    },
    {
      key: 'Territory',
      render: (ent) => <HoverableEntityName ent={ent.territory} />,
      isInitiallyVisible: false,
      field: Field.Territory,
      columnGroup: 'Linked Data',
    },
    {
      key: 'Territory Scope',
      render: (ent) => getTerritoryScopeLabel(ent.territory?.scope),
      isInitiallyVisible: false,
      columnGroup: 'Linked Data',
      field: Field.TerritoryScope,
    },
    {
      key: 'Countries',
      render: (ent) => (
        <HoverableEnumeration items={getCountriesInEntity(ent)?.map((t) => t.nameDisplay)} />
      ),
      isInitiallyVisible: false,
      field: Field.CountOfCountries,
      columnGroup: 'Linked Data',
    },
    {
      key: 'Variants',
      render: (ent) =>
        ent.variants && (
          <CommaSeparated limit={1}>
            {ent.variants.map((vt) => (
              <HoverableEntityName ent={vt} key={vt.ID} />
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
        loc.language && <HoverableEntityName ent={getLanguageRootMacrolanguage(loc.language)} />,
      isInitiallyVisible: false,
      columnGroup: 'Linked Data',
    },
    {
      key: 'Language Family',
      render: (loc) =>
        loc.language && <HoverableEntityName ent={getLanguageRootLanguageFamily(loc.language)} />,
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
      render: (ent) => <EntityWikipediaInfo ent={ent} />,
      isInitiallyVisible: false,
    },
    {
      key: 'Locale Source',
      render: (ent) => toSentenceCase(ent.localeSource),
      isInitiallyVisible: false,
    },
  ];
}

export default getLocaleColumns;
