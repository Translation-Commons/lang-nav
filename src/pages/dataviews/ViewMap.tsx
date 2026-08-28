import { ReactNode } from 'react';

import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import EntityMap from '@features/map/EntityMap';
import MapContainer from '@features/map/MapContainer';
import usePagination from '@features/pagination/usePagination';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';
import InternalLink from '@features/params/InternalLink';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

import { getEntityTypeLabelPlural } from '@entities/lib/getEntityName';
import { EntityData } from '@entities/types/DataTypes';

import CommaSeparated from '@shared/ui/CommaSeparated';

function ViewMap() {
  const { entType } = usePageParams();
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
      <div>{getMapDescription(entType)}</div>
      {!isDrawingTerritories && <VisibleItemsMeter ents={allEntities} />}
      <EntityMap entities={filteredEntities} allowSidebar={true} />
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
          This map shows countries by the top language in each area. Hover over a country to see
          more details about its top locale. To get the best out of this view, use the coloring
          option and modify the filters to limit the locales. For instance{' '}
          <InternalLink
            params={{
              languageFilter: 'French [fra]',
              writingSystemFilter: '',
              colorBy: Field.PercentOfTerritoryPopulation,
            }}
            keepOldParams={true}
          >
            [show the countries where French is spoken]
          </InternalLink>{' '}
          or{' '}
          <InternalLink
            params={{
              languageFilter: '',
              writingSystemFilter: 'Devanagari [Deva]',
              colorBy: Field.PercentOfTerritoryPopulation,
            }}
            keepOldParams={true}
          >
            [show the countries by the largest language there written in Devanagari]
          </InternalLink>
          .
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
