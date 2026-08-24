import { ReactNode } from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityMap from '@features/map/EntityMap';
import MapContainer from '@features/map/MapContainer';
import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import { EntityType } from '@features/params/PageParamTypes';
import {
    SelectorDisplay,
    SelectorDisplayProvider,
} from '@features/params/ui/SelectorDisplayContext';
import usePageParams from '@features/params/usePageParams';
import ColorBySelector from '@features/transforms/coloring/ColorBySelector';
import ColorGradientSelector from '@features/transforms/coloring/ColorGradientSelector';
import Field from '@features/transforms/fields/Field';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';
import { EntityData } from '@entities/types/DataTypes';

import { toTitleCase } from '@shared/lib/stringUtils';
import CommaSeparated from '@shared/ui/CommaSeparated';

function ViewMap() {
  const { colorBy, entType } = usePageParams();
  const { filteredEntities, allEntities } = useFilteredEntities({});
  const { getCurrentEntities } = usePagination<EntityData>();

  const isDrawingTerritories = entType !== EntityType.Language;

  if ([EntityType.Variant, EntityType.Keyboard, EntityType.Org].includes(entType)) {
    return (
      <div>
        Map view is not well-defined for {getEntityTypeLabelPlural(entType)}. Please select a
        different entity type.
      </div>
    );
  }

  const entsWithoutCoordinates =
    entType == EntityType.Language
      ? getCurrentEntities(filteredEntities).filter(
          (ent) =>
            ent.type === EntityType.Language && (ent.latitude == null || ent.longitude == null),
        )
      : [];

  return (
    <MapContainer>
      <h2 style={{ margin: 0 }}>{toTitleCase(entType)} Map</h2>
      <div>{getMapDescription(entType)}</div>
      {!isDrawingTerritories && <VisibleItemsMeter ents={allEntities} />}
      <EntityMap entities={filteredEntities} allowSidebar={true} />
      <SelectorDisplayProvider display={SelectorDisplay.InlineDropdown}>
        <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          <div>
            {colorBy === Field.None ? `You can color the shapes by:` : `Shapes are colored by `}
          </div>
          <ColorBySelector entType={isDrawingTerritories ? EntityType.Territory : entType} />
          <div>{colorBy !== Field.None && 'using the color gradient'}</div>
          <ColorGradientSelector />
        </div>
      </SelectorDisplayProvider>
      {entsWithoutCoordinates.length > 0 && (
        <div>
          The following {getEntityTypeLabelPlural(entType)} do not have defined coordinates:{' '}
          <CommaSeparated limit={10}>
            {entsWithoutCoordinates.map((ent) => (
              <HoverableEntityName key={ent.ID} ent={ent} />
            ))}
          </CommaSeparated>
        </div>
      )}
    </MapContainer>
  );
}

function getMapDescription(entType: EntityType): ReactNode {
  switch (entType) {
    case EntityType.Language:
      return (
        <>
          These coordinates show the &quot;primary&quot; location of the languages, as defined by
          Glottolog. This could be the centroid of the area where the language is spoken, or a
          significant location such as a major city where the language has a presence. It does not
          represent all the locations where the language is spoken.
        </>
      );
    case EntityType.Territory:
      return (
        <>
          Large territories are polygons, smaller territories are represented by circles at their
          centroid coordinates. Mouse over a territory to see more information about it and click it
          to see the territory details.
        </>
      );
    case EntityType.Census:
      return (
        <>
          While we do not yet have official censuses tables for every country, you can see here the
          countries that have population data available and hover over to see more details. Most
          countries have CLDR data.
        </>
      );
    case EntityType.Locale:
      return (
        <>
          The current view shows the territories of the world with how many languages or locales we
          have associated with them. Hover over the countries to see the list.
        </>
      );
    case EntityType.WritingSystem:
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
