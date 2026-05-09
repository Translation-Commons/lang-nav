import { getFieldValueType } from '@features/table/getValueType';
import TableValueType from '@features/table/TableValueType';

import { LanguageModality } from '@entities/language/LanguageModality';
import { getModalityLabel } from '@entities/language/LanguageModalityDisplay';
import { LanguageScope } from '@entities/language/LanguageTypes';
import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';
import { ObjectData } from '@entities/types/DataTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';
import { getTerritoryScopeLabel } from '@strings/TerritoryScopeStrings';

import Field from './Field';
import getField from './getField';

/**
 * Converts numbers to reasonably formatted strings.
 *
 * Converts enum values to their corresponding labels.
 */
export function getFieldString(object: ObjectData, field: Field): string | undefined {
  const value = getField(object, field);
  if (value == null) return value;
  switch (getFieldValueType(field)) {
    case TableValueType.Date:
      if (typeof value === 'string') return value;
      return value ? new Date(value).toLocaleDateString() : undefined;
    case TableValueType.Population:
    case TableValueType.Count:
      if (typeof value === 'string') return value;
      return value.toLocaleString();
    case TableValueType.Decimal:
      if (typeof value === 'string') return value;
      return value.toFixed(1);
    case TableValueType.Enum:
      return getFieldEnumLabel(value, field);
    case TableValueType.String:
      return value.toString();
  }
}

function getFieldEnumLabel(value: string | number | undefined, field: Field): string | undefined {
  switch (field) {
    case Field.ISOStatus:
      return getLanguageISOStatusLabel(value as LanguageISOStatus);
    case Field.LanguageScope:
      return getLanguageScopeLabel(value as LanguageScope);
    case Field.Modality:
      return getModalityLabel(value as LanguageModality);
    case Field.TerritoryScope:
      return getTerritoryScopeLabel(value as TerritoryScope);
    case Field.WritingSystemScope:
    default:
      return value?.toString();
  }
}
