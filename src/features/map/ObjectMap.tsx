import React from 'react';

import { getSliceFunction } from '@features/filtering/filter';
import Hoverable from '@features/hovercard/Hoverable';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';

import { ObjectData } from '@entities/types/DataTypes';

const ObjectMap: React.FC<{ objects: ObjectData[] }> = ({ objects }) => {
  const sliceFunction = getSliceFunction<ObjectData>();

  return (
    <div>
      <Hoverable hoverContent="This is an object map.">
        <h2>Object Map Component</h2>
      </Hoverable>
      <table style={{ textAlign: 'left' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {sliceFunction(objects).map((obj) => (
            <tr key={obj.ID}>
              <td>{obj.ID}</td>
              <td>
                <HoverableObjectName object={obj} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ObjectMap;
