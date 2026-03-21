import { Transform } from 'stream';

import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import { ObjectType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import {
  FIELDS_IN_DEVELOPMENT,
  getApplicableFields,
  isFieldApplicable,
  UNINTERESTING_FIELD_COMBINATIONS,
} from '@features/transforms/fields/FieldApplicability';
import getField from '@features/transforms/fields/getField';

describe('getApplicableFields', () => {
  it('should not return duplicate Fields values for any ObjectType', () => {
    Object.values(ObjectType).forEach((objectType) => {
      const fields = getApplicableFields(undefined, objectType);
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    });
  });

  it('Check that all possible Fields are returned for each object type. Literally, if a field is not returned by getApplicableFields intersected with object type, then getField should not return a truthy value for it.', () => {
    const mockedObjects = getFullyInstantiatedMockedObjects();

    Object.values(ObjectType).forEach((objectType) => {
      const objectsInType = Object.values(mockedObjects).filter((obj) => obj.type === objectType);
      const fieldsForType = getApplicableFields(undefined, objectType);

      Object.values(Field).forEach((field) => {
        objectsInType.forEach((obj) => {
          const fieldValue = getField(obj, field);
          if (
            !fieldsForType.includes(field) &&
            !UNINTERESTING_FIELD_COMBINATIONS[objectType]?.includes(field) &&
            !FIELDS_IN_DEVELOPMENT.includes(field)
          ) {
            // The value is not supposed to be applicable
            expect(
              fieldValue,
              `ObjectType (${objectType}) should not return a value for ${field} but it has a getField value so it should be applicable. Failed on object: ${obj.nameDisplay} [${obj.ID}]`,
            ).toBeFalsy();
          }
        });
      });
    });
  });

  it('getApplicableFields matches isFieldApplicable', () => {
    Object.values(ObjectType).forEach((objectType) => {
      Object.values(Transform).forEach((transform) => {
        const applicableFields = getApplicableFields(transform, objectType);

        Object.values(Field).forEach((field) => {
          const isApplicable = applicableFields.includes(field);
          if (isApplicable) {
            expect(isFieldApplicable(field, transform, objectType)).toBe(true);
          } else {
            expect(isFieldApplicable(field, transform, objectType)).toBe(false);
          }
        });
      });
    });
  });
});
