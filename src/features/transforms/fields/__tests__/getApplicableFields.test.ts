import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedEntities } from '@features/__tests__/MockEntities';
import { EntityType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import {
  FIELDS_IN_DEVELOPMENT,
  getApplicableFields,
  isFieldApplicable,
  UNINTERESTING_FIELD_COMBINATIONS,
} from '@features/transforms/fields/FieldApplicability';
import getField from '@features/transforms/fields/getField';
import TransformEnum from '@features/transforms/TransformEnum';

describe('getApplicableFields', () => {
  it('should not return duplicate Fields values for any EntityType', () => {
    Object.values(EntityType).forEach((entityType) => {
      const fields = getApplicableFields(undefined, entityType);
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    });
  });

  it('Check that all possible Fields are returned for each entity type. Literally, if a field is not returned by getApplicableFields intersected with entity type, then getField should not return a truthy value for it.', () => {
    const mockedEnts = getFullyInstantiatedMockedEntities();

    Object.values(EntityType).forEach((entityType) => {
      const entsInType = Object.values(mockedEnts).filter((ent) => ent.type === entityType);
      const fieldsForType = getApplicableFields(undefined, entityType);

      Object.values(Field).forEach((field) => {
        entsInType.forEach((ent) => {
          const fieldValue = getField(ent, field);
          if (
            !fieldsForType.includes(field) &&
            !UNINTERESTING_FIELD_COMBINATIONS[entityType]?.includes(field) &&
            !FIELDS_IN_DEVELOPMENT.includes(field)
          ) {
            // The value is not supposed to be applicable
            expect(
              fieldValue,
              `EntityType (${entityType}) should not return a value for ${field} but it has a getField value so it should be applicable. Failed on ent: ${ent.nameDisplay} [${ent.ID}]`,
            ).toBeFalsy();
          }
        });
      });
    });
  });

  it('getApplicableFields matches isFieldApplicable', () => {
    Object.values(EntityType).forEach((entityType) => {
      Object.values(TransformEnum).forEach((transform) => {
        const applicableFields = getApplicableFields(transform, entityType);

        Object.values(Field).forEach((field) => {
          const isApplicable = applicableFields.includes(field);
          if (isApplicable) {
            expect(isFieldApplicable(field, transform, entityType)).toBe(true);
          } else {
            expect(isFieldApplicable(field, transform, entityType)).toBe(false);
          }
        });
      });
    });
  });
});
