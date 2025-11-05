import { getSliceFunction } from '@features/filtering/filter';
import useFilteredObjects from '@features/filtering/useFilteredObjects';
import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import ObjectMap from '@features/map/ObjectMap';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';

import { ObjectData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

import './styles.css';

function ViewMap() {
  const { objectType } = usePageParams();
  const { filteredObjects } = useFilteredObjects({});
  const sliceFunction = getSliceFunction<ObjectData>();

  if (objectType !== ObjectType.Language) {
    return <div>Map view is in Beta mode and is only available for Languages.</div>;
  }

  const objectsWithoutCoordinates = sliceFunction(filteredObjects).filter((obj) =>
    obj.type === ObjectType.Language ? obj.latitude == null || obj.longitude == null : true,
  );

  return (
    <div
      style={{
        alignItems: 'center',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
      }}
    >
      <div>
        These coordinates show the &quot;primary&quot; location of the languages, as defined by
        Glottolog. This could be the centroid of the area where the language is spoken, or a
        significant location such as a major city where the language has a presence. It does not
        represent all the locations where the language is spoken.
      </div>
      <VisibleItemsMeter objects={filteredObjects} />
      <ObjectMap objects={filteredObjects} borders={'no_borders'} />
      {objectsWithoutCoordinates.length > 0 && (
        <div>
          The following languages do not have defined coordinates:{' '}
          <CommaSeparated limit={10}>
            {objectsWithoutCoordinates.map((obj) => (
              <HoverableObjectName key={obj.ID} object={obj} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </div>
  );
}

export default ViewMap;
