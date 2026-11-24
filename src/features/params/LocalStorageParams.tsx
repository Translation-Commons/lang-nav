import { LanguageCodeFormat } from '@entities/language/LanguageTypes';

import { PageBrightnessParams, usePageBrightness } from '@shared/hooks/usePageBrightness';

import useStoredParams from './useStoredParams';

export enum LocaleSeparator {
  Underscore = '_',
  Hyphen = '-',
}

export type LocalStorageParams = {
  localeSeparator: LocaleSeparator;
  brightness: PageBrightnessParams;
  languageCodeFormat: LanguageCodeFormat;
  showMapBorders: boolean;
  showMapAsGlobe: boolean;

  setLocaleSeparator: (value: LocaleSeparator) => void;
  setLanguageCodeFormat: (value: LanguageCodeFormat) => void;
  setShowMapBorders: (value: boolean) => void;
  setShowMapAsGlobe: (value: boolean) => void;
};

/** These parameters are saved in local storage and persist between sessions */
const useLocalStorageParams = (): LocalStorageParams => {
  const brightness = usePageBrightness();
  const { value: localeSeparator, setValue: setLocaleSeparator } = useStoredParams<LocaleSeparator>(
    'localeSeparator',
    LocaleSeparator.Underscore,
    'local',
  );
  const { value: languageCodeFormat, setValue: setLanguageCodeFormat } =
    useStoredParams<LanguageCodeFormat>('languageCodeFormat', LanguageCodeFormat.Unset, 'local');
  // Off by default: languages cross borders, so the map shouldn't box them in by country.
  const { value: showMapBorders, setValue: setShowMapBorders } = useStoredParams<boolean>(
    'showMapBorders',
    false,
    'local',
  );
  const { value: showMapAsGlobe, setValue: setShowMapAsGlobe } = useStoredParams<boolean>(
    'showMapAsGlobe',
    false,
    'local',
  );

  return {
    localeSeparator,
    setLocaleSeparator,
    brightness,
    languageCodeFormat,
    setLanguageCodeFormat,
    showMapBorders,
    setShowMapBorders,
    showMapAsGlobe,
    setShowMapAsGlobe,
  };
};

export default useLocalStorageParams;
