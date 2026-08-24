import { EntityType } from '@features/params/PageParamTypes';
import TableColumn from '@features/table/TableColumn';

import { EntityData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import getCensusColumns from './CensusColumns';
import getKeyboardColumns from './KeyboardColumns';
import getLanguageColumns from './LanguageColumns';
import getLocaleColumns from './LocaleColumns';
import getOrganizationColumns from './OrganizationColumns';
import getTerritoryColumns from './TerritoryColumns';
import getVariantColumns from './VariantColumns';
import getWritingSystemColumns from './WritingSystemColumns';

function getEntityMainTableColumns(entityType: EntityType): TableColumn<EntityData>[] {
  switch (entityType) {
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
      enforceExhaustiveSwitch(entityType);
  }
}

export default getEntityMainTableColumns;
