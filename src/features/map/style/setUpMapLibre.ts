import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

// MapLibre finds its worker next to its own file, which Vite moves when bundling. Hand it the
// URL of a worker Vite has bundled itself.
setWorkerUrl(workerUrl);
