import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import { ObjectType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import getField from '@features/transforms/fields/getField';

const IGNORED_COMBINATIONS: Partial<Record<ObjectType, Field[]>> = {
  [ObjectType.Census]: [
    Field.CountOfCensuses,
    Field.CountOfChildTerritories,
    Field.CountOfCountries,
  ], // It's always 1 for censuses
  [ObjectType.Language]: [Field.VitalityEthnologueCoarse, Field.VitalityEthnologueFine],
  [ObjectType.Locale]: [Field.VitalityEthnologueCoarse, Field.VitalityEthnologueFine],
};

describe('getApplicableFields', () => {
  it('should not return duplicate Fields values for any ObjectType', () => {
    Object.values(ObjectType).forEach((objectType) => {
      const fields = getApplicableFields(undefined, objectType);
      const uniqueFields = new Set(fields);
      expect(uniqueFields.size).toBe(fields.length);
    });
  });

  it('Check that all possible Fields are returned for each object type. Literally, if a field is not returned by getFieldsForSorting intersected with object type, then getField should not return a truthy value for it.', () => {
    const mockedObjects = getFullyInstantiatedMockedObjects();

    Object.values(ObjectType).forEach((objectType) => {
      const objectsInType = Object.values(mockedObjects).filter((obj) => obj.type === objectType);
      const fieldsForType = getApplicableFields(undefined, objectType);

      Object.values(Field).forEach((field) => {
        objectsInType.forEach((obj) => {
          const sortField = getField(obj, field);
          if (
            !fieldsForType.includes(field) &&
            !IGNORED_COMBINATIONS[objectType]?.includes(field)
          ) {
            // The value is not supposed to be applicable
            expect(
              sortField,
              `ObjectType (${objectType}) shouldn't be sorted by ${field} but it has a getField value so it should be applicable. Failed on object: ${obj.nameDisplay} [${obj.ID}]`,
            ).toBeFalsy();
          }
        });
      });
    });
  });
});
