import { PageBrightness, usePageBrightness } from '@shared/hooks/usePageBrightness';

import useStoredParams from './useStoredParams';

export enum LocaleSeparator {
  Underscore = '_',
  Hyphen = '-',
}

export type LocalStorageParams = {
  localeSeparator: LocaleSeparator;
  brightness: PageBrightness;

  setLocaleSeparator: (value: LocaleSeparator) => void;
};

/** These parameters are saved in local storage and persist between sessions */
const useLocalStorageParams = (): LocalStorageParams => {
  const pageBrightness = usePageBrightness();
  const { value: localeSeparator, setValue: setLocaleSeparator } = useStoredParams<LocaleSeparator>(
    'localeSeparator',
    LocaleSeparator.Underscore,
    'local',
  );

  return { localeSeparator, setLocaleSeparator, brightness: pageBrightness.pageBrightness };
};

export default useLocalStorageParams;
