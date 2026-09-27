import TableColumn from '@features/table/TableColumn';

import getCensusColumns from '@entities/census/CensusColumns';
import getKeyboardColumns from '@entities/keyboard/KeyboardColumns';
import getLanguageColumns from '@entities/language/LanguageColumns';
import getLocaleColumns from '@entities/locale/LocaleColumns';
import getOrganizationColumns from '@entities/org/OrganizationColumns';
import getTerritoryColumns from '@entities/territory/TerritoryColumns';
import { EntityData, EntityType } from '@entities/types/EntityTypes';
import getVariantColumns from '@entities/variant/VariantColumns';
import getWritingSystemColumns from '@entities/writingsystem/WritingSystemColumns';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

function getEntityMainTableColumns(entType: EntityType): TableColumn<EntityData>[] {
  switch (entType) {
    case EntityType.Language:
      return getLanguageColumns() as TableColumn<EntityData>[];
    case EntityType.Locale:
      return getLocaleColumns() as TableColumn<EntityData>[];
    case EntityType.Territory:
      return getTerritoryColumns() as TableColumn<EntityData>[];
    case EntityType.WritingSystem:
      return getWritingSystemColumns() as TableColumn<EntityData>[];
    case EntityType.Variant:
      return getVariantColumns() as TableColumn<EntityData>[];
    case EntityType.Keyboard:
      return getKeyboardColumns() as TableColumn<EntityData>[];
    case EntityType.Census:
      return getCensusColumns() as TableColumn<EntityData>[];
    case EntityType.Org:
      return getOrganizationColumns() as TableColumn<EntityData>[];
    default:
      enforceExhaustiveSwitch(entType);
  }
}

export default getEntityMainTableColumns;
