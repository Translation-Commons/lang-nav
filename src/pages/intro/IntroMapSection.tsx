import React, { useEffect, useMemo, useState } from 'react';

import EntityMap from '@features/map/EntityMap';
import usePageParams from '@features/params/usePageParams';
import useFilteredEntities from '@features/transforms/filtering/useFilteredEntities';

// How many languages to show at minimum (fully zoomed out) and maximum (fully
// zoomed in, matching EntityMap's default max zoom multiplier of 8). Entities
// are already sorted by population descending, so zooming in progressively
// reveals smaller/more local languages on top of the world's biggest ones.
const MIN_VISIBLE = 60;
const MAX_VISIBLE = 300;
const MAX_ZOOM_FACTOR = 8;

function getVisibleEntityCount(zoomFactor: number): number {
  const progress = Math.min(1, Math.max(0, (zoomFactor - 1) / (MAX_ZOOM_FACTOR - 1)));
  return Math.round(MIN_VISIBLE + progress * (MAX_VISIBLE - MIN_VISIBLE));
}

const IntroMapSection: React.FC = () => {
  // No active filters = the full entity set, same as the Data page's default map view.
  const { filteredEntities } = useFilteredEntities({});
  const [zoomFactor, setZoomFactor] = useState(1);
  const visibleCount = useMemo(() => getVisibleEntityCount(zoomFactor), [zoomFactor]);
  const visibleEntities = useMemo(
    () => filteredEntities.slice(0, visibleCount),
    [filteredEntities, visibleCount],
  );

  // In Language mode, the map otherwise pagination-slices to the global `limit` page
  // param (default 12) — sensible on the Data page where pagination controls exist,
  // but there's no pagination UI here. Set once to a ceiling comfortably above
  // MAX_VISIBLE so that internal slicing never re-clips our own local, zoom-driven
  // slice below — the actual visible count is controlled entirely by `visibleEntities`.
  const { limit, updatePageParams } = usePageParams();
  useEffect(() => {
    if (limit !== MAX_VISIBLE) updatePageParams({ limit: MAX_VISIBLE });
    // Only meant to run once on mount; deliberately not reacting to limit changes
    // made elsewhere (e.g. if the user later sets a limit on the Data page).
  }, []);

  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <h2 style={{ margin: '0 0 0.25em' }}>Explore the Map</h2>
      <p style={{ margin: '0 0 1em' }}>
        Pan, zoom, and click a territory to pin it — zoom in for more languages.
      </p>
      {/* Deliberately not wrapped in MapContainer (its min-width: 800px would break
          mobile) — EntityMap sizes itself responsively via its own ResizeObserver. */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        {/* allowSidebar is required here, not just preferred: EntityMap's non-sidebar click
            behavior sets the `objectID` page param expecting a DetailsPanel to react to it,
            but DetailsPanel is only ever mounted inside DataPage. On the Intro page that
            click would silently do nothing without allowSidebar's pin-to-sidebar behavior. */}
        <EntityMap
          entities={visibleEntities}
          allowSidebar
          maxWidth={1100}
          onZoomChange={setZoomFactor}
        />
      </div>
    </div>
  );
};

export default IntroMapSection;
