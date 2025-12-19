import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';
import { ObjectType } from '@features/params/PageParamTypes';
import { getSortField } from '@features/transforms/fields/getField';

import getSortBysApplicableToObjectType from '../getSortBysApplicableToObjectType';
import { SortBy } from '../SortTypes';

describe('getSortBysApplicableToObjectType', () => {
  it('should not return duplicate SortBy values for any ObjectType', () => {
    Object.values(ObjectType).forEach((objectType) => {
      const sortBys = getSortBysApplicableToObjectType(objectType);
      const uniqueSortBys = new Set(sortBys);
      expect(uniqueSortBys.size).toBe(sortBys.length);
    });
  });

  it('Check that all possible SortBys are returned for each object type. Literally, if a sortBy is not returned by getSortBysApplicableToObjectType, then getSortField should not return a truthy value for it.', () => {
    const mockedObjects = getFullyInstantiatedMockedObjects();

    Object.values(ObjectType).forEach((objectType) => {
      const objectsInType = Object.values(mockedObjects).filter((obj) => obj.type === objectType);
      const sortBysForType = getSortBysApplicableToObjectType(objectType);

      Object.values(SortBy).forEach((sortBy) => {
        objectsInType.forEach((obj) => {
          const sortField = getSortField(obj, sortBy);
          if (!sortBysForType.includes(sortBy) && sortBy !== SortBy.CountOfDialects) {
            // The value is not supposed to be applicable
            expect(
              sortField,
              `ObjectType (${objectType}) shouldn't be sorted by ${sortBy} but it has a getSortField value so it should be sortable. Failed on object: ${obj.nameDisplay} [${obj.ID}]`,
            ).toBeFalsy();
          }
        });
      });
    });
  });
});
