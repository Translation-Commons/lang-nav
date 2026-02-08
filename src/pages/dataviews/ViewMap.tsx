import { ReactNode } from 'react';

import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import MapContainer from '@features/map/MapContainer';
import ObjectMap from '@features/map/ObjectMap';
import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import { ObjectType } from '@features/params/PageParamTypes';
import {
  SelectorDisplay,
  SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import Field from '@features/transforms/fields/Field';
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

  const isDrawingTerritories = objectType !== ObjectType.Language;

  if (objectType === ObjectType.VariantTag) {
    return (
      <div>
        Map view is not well-defined for Variant Tags. Please select a different object type.
      </div>
    );
  }

  const objectsWithoutCoordinates =
    objectType == ObjectType.Language
      ? getCurrentObjects(filteredObjects).filter(
          (obj) =>
            obj.type === ObjectType.Language && (obj.latitude == null || obj.longitude == null),
        )
      : [];

  return (
    <MapContainer>
      <h2 style={{ margin: 0 }}>{toTitleCase(objectType)} Map</h2>
      <div>{getMapDescription(objectType)}</div>
      {!isDrawingTerritories && <VisibleItemsMeter objects={filteredObjects} />}
      <ObjectMap objects={filteredObjects} />
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          <div>
            {colorBy === Field.None ? `You can color the shapes by:` : `Shapes are colored by `}
          </div>
          <ColorBySelector objectType={isDrawingTerritories ? ObjectType.Territory : objectType} />
          <div>{colorBy !== Field.None && 'using the color gradient'}</div>
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
    </MapContainer>
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
      return (
        <>
          Large territories are polygons, smaller territories are represented by circles at their
          centroid coordinates. Mouse over a territory to see more information about it and click it
          to see the territory details.
        </>
      );
    case ObjectType.Census:
      return (
        <>
          While we do not yet have official censuses tables for every country, you can see here the
          countries that have population data available and hover over to see more details. Most
          countries have CLDR data.
        </>
      );
    case ObjectType.Locale:
      return (
        <>
          The current view shows the territories of the world with how many languages or locales we
          have associated with them. Hover over the countries to see the list.
        </>
      );
    case ObjectType.WritingSystem:
      return (
        <>
          The current view shows the territories of the world with how many writing systems are
          associated with them. Hover over the countries to see the list.
        </>
      );
    default:
      return '';
  }
}

export default ViewMap;
