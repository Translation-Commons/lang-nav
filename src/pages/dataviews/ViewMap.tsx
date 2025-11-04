import useFilteredObjects from '@features/filtering/useFilteredObjects';
import ObjectMap from '@features/map/ObjectMap';
import { ObjectType } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';
import VisibleItemsMeter from '@features/pagination/VisibleItemsMeter';

import './styles.css';

function ViewMap() {
  const { objectType } = usePageParams();
  const filteredObjects = useFilteredObjects({});

  if (objectType !== ObjectType.Language) {
    return <div>Map view is in Beta mode and is only available for Languages.</div>;
  }

  return (
    <div style={{ textAlign: 'center', margin: '0 auto' }}>
      These coordinates show the &quot;primary&quot; location of the languages, as defined by
      Glottolog. This could be the centroid of the area where the language is spoken, or a
      significant location such as a major city where the language has a presence. It does not
      represent all the locations where the language is spoken.
      <VisibleItemsMeter objects={filteredObjects} />
      <ObjectMap objects={filteredObjects} borders={'no_borders'} />
    </div>
  );
}

export default ViewMap;
