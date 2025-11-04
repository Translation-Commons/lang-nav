import { getSliceFunction } from '@features/filtering/filter';
import useFilteredObjects from '@features/filtering/useFilteredObjects';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import ObjectMap from '@features/map/ObjectMap';

import { ObjectData } from '@entities/types/DataTypes';

import './styles.css';

function ViewMap() {
  const filteredObjects = useFilteredObjects({});
  const sliceFunction = getSliceFunction<ObjectData>();

  return (
    <>
      <ObjectMap objects={filteredObjects} />

      <table style={{ textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {sliceFunction(filteredObjects).map((obj) => (
            <tr key={obj.ID}>
              <td>{obj.ID}</td>
              <td>
                <HoverableObjectName object={obj} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default ViewMap;
