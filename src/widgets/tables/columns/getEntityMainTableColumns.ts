import { ObjectType } from '@features/params/PageParamTypes';
import TableColumn from '@features/table/TableColumn';

import { ObjectData } from '@entities/types/DataTypes';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

import getCensusColumns from './CensusColumns';
import getKeyboardColumns from './KeyboardColumns';
import getLanguageColumns from './LanguageColumns';
import getLocaleColumns from './LocaleColumns';
import getTerritoryColumns from './TerritoryColumns';
import getVariantColumns from './VariantColumns';
import getWritingSystemColumns from './WritingSystemColumns';

function getEntityMainTableColumns(entityType: ObjectType): TableColumn<ObjectData>[] {
  switch (entityType) {
    case ObjectType.Language:
      return getLanguageColumns() as TableColumn<ObjectData>[];
    case ObjectType.Locale:
      return getLocaleColumns() as TableColumn<ObjectData>[];
    case ObjectType.Territory:
      return getTerritoryColumns() as TableColumn<ObjectData>[];
    case ObjectType.WritingSystem:
      return getWritingSystemColumns() as TableColumn<ObjectData>[];
    case ObjectType.VariantTag:
      return getVariantColumns() as TableColumn<ObjectData>[];
    case ObjectType.Keyboard:
      return getKeyboardColumns() as TableColumn<ObjectData>[];
    case ObjectType.Census:
      return getCensusColumns() as TableColumn<ObjectData>[];
    default:
      enforceExhaustiveSwitch(entityType);
  }
}

export default getEntityMainTableColumns;
