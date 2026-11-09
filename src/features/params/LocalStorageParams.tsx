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
  showMapCountryNames: boolean;

  setLocaleSeparator: (value: LocaleSeparator) => void;
  setLanguageCodeFormat: (value: LanguageCodeFormat) => void;
  setShowMapCountryNames: (value: boolean) => void;
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
  const { value: showMapCountryNames, setValue: setShowMapCountryNames } = useStoredParams<boolean>(
    'showMapCountryNames',
    true,
    'local',
  );

  return {
    localeSeparator,
    setLocaleSeparator,
    brightness,
    languageCodeFormat,
    setLanguageCodeFormat,
    showMapCountryNames,
    setShowMapCountryNames,
  };
};

export default useLocalStorageParams;
