import Field from '@features/transforms/fields/Field';

import getCensusColumns from '@entities/census/CensusColumns';
import getKeyboardColumns from '@entities/keyboard/KeyboardColumns';
import getLanguageColumns from '@entities/language/LanguageColumns';
import getLocaleColumns from '@entities/locale/LocaleColumns';
import getOrganizationColumns from '@entities/org/OrganizationColumns';
import getOrthographyColumns from '@entities/orthography/OrthographyColumns';
import getTerritoryColumns from '@entities/territory/TerritoryColumns';
import { EntityType } from '@entities/types/EntityTypes';
import getVariantColumns from '@entities/variant/VariantColumns';
import getWritingSystemColumns from '@entities/writingsystem/WritingSystemColumns';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

// Columns come from several row/entity shapes (BaseRow-backed and EntityData-backed); callers
// here only need the field metadata, not render/exportValue, so the return type stays shape-agnostic.
type FieldOnlyColumn = { field?: Field };

function getEntityMainTableColumns(entType: EntityType): FieldOnlyColumn[] {
  switch (entType) {
    case EntityType.Language:
      return getLanguageColumns();
    case EntityType.Locale:
      return getLocaleColumns();
    case EntityType.Territory:
      return getTerritoryColumns();
    case EntityType.WritingSystem:
      return getWritingSystemColumns();
    case EntityType.Orthography:
      return getOrthographyColumns();
    case EntityType.Variant:
      return getVariantColumns();
    case EntityType.Keyboard:
      return getKeyboardColumns();
    case EntityType.Census:
      return getCensusColumns();
    case EntityType.Org:
      return getOrganizationColumns();
    case EntityType.Technology:
      // TODO add Technology Entity
      return [];
    default:
      enforceExhaustiveSwitch(entType);
  }
}

export default getEntityMainTableColumns;
