import { DatabaseIcon, FilesIcon } from 'lucide-react';

import {
  hasConfiguredApiUrl,
  isApiEnabled,
  setApiOverride,
} from '@features/data/load/api/apiConfig';

import { Toggle } from '@shared/ui/toggle.tsx';

/**
 * Switches the data source between the API and the TSV files at runtime.
 *
 * Reloads the page on every change rather than re-fetching in place: every
 * loader reads getApiBaseUrl() once, at load time, so nothing downstream
 * re-runs on its own. A full reload is also what makes the override visible
 * in the network tab as a clean before/after, which is what this control is
 * for during backend migration testing.
 *
 * Renders nothing when the build never configured VITE_API_URL - there is no
 * API for the toggle to switch to, so offering it would just be a button that
 * does nothing.
 */
const ApiToggle = () => {
  if (!hasConfiguredApiUrl()) return null;

  const enabled = isApiEnabled();

  const handlePressedChange = (next: boolean) => {
    setApiOverride(next ? 'on' : 'off');
    window.location.reload();
  };

  return (
    <>
      <div className="text-right">Data Source</div>
      <Toggle
        aria-label={
          enabled
            ? 'API enabled, click to switch to files'
            : 'Files enabled, click to switch to API'
        }
        title="Switches between the API and the TSV files. Reloads the page."
        pressed={enabled}
        onPressedChange={handlePressedChange}
        variant="outline"
      >
        {enabled ? <DatabaseIcon /> : <FilesIcon />}
        {enabled ? 'API' : 'Files'}
      </Toggle>
    </>
  );
};

export default ApiToggle;
