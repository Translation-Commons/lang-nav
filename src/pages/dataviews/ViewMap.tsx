import useFilteredObjects from '@features/filtering/useFilteredObjects';
import ObjectMap from '@features/map/ObjectMap';
import './styles.css';

function ViewMap() {
  const filteredObjects = useFilteredObjects({});

  return <ObjectMap objects={filteredObjects} />;
}

export default ViewMap;
