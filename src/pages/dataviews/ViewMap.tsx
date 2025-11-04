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
    <>
      <VisibleItemsMeter objects={filteredObjects} />
      <ObjectMap objects={filteredObjects} borders={'no_borders'} />
    </>
  );
}

export default ViewMap;
