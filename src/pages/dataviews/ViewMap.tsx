import { ReactNode } from 'react';

import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@widgets/controls/components/SelectorDisplayContext';

import HoverableObjectName from '@features/hovercard/HoverableObjectName';
import ObjectMap from '@features/map/ObjectMap';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import useFilteredObjects from '@features/transforms/filtering/useFilteredObjects';

import { getObjectTypeLabelPlural } from '@entities/lib/getObjectName';
import { ObjectData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

import './styles.css';
function ViewMap() {
  const { colorBy, objectType } = usePageParams();
  const { filteredObjects } = useFilteredObjects({});
  const { getCurrentObjects } = usePagination<ObjectData>();

  if (objectType !== ObjectType.Language && objectType !== ObjectType.Territory) {
    return (
      <div>
        Map view is in Beta <em>β</em> mode and is only available for Languages and Territories.
      </div>
    );
  }

  const objectsWithoutCoordinates = getCurrentObjects(filteredObjects).filter((obj) =>
    obj.type === ObjectType.Language || obj.type === ObjectType.Territory
      ? obj.latitude == null || obj.longitude == null
      : true,
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
      <h2 style={{ margin: 0 }}>{toTitleCase(objectType)} Map</h2>
      <div>{getMapDescription(objectType)}</div>
      <VisibleItemsMeter objects={filteredObjects} />
      <ObjectMap objects={filteredObjects} />
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          <div>
            {colorBy === 'None'
              ? 'You can color the circles using this selector:'
              : `Circles are colored by `}
          </div>
          <ColorBySelector />
          <div>{colorBy !== 'None' && 'using the color gradient'}</div>
          <ColorGradientSelector />
        </div>
      </SelectorDisplayProvider>
      {objectsWithoutCoordinates.length > 0 && (
        <div>
          The following {getObjectTypeLabelPlural(objectType)} do not have defined coordinates:{' '}
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

function getMapDescription(objectType: ObjectType): ReactNode {
  switch (objectType) {
    case ObjectType.Language:
      return (
        <>
          These coordinates show the &quot;primary&quot; location of the languages, as defined by
          Glottolog. This could be the centroid of the area where the language is spoken, or a
          significant location such as a major city where the language has a presence. It does not
          represent all the locations where the language is spoken.
        </>
      );
    case ObjectType.Territory:
      return 'These coordinates represent the geographical center of the territory.';
    default:
      return '';
  }
}

export default ViewMap;
