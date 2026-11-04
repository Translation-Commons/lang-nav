import { LanguageCodeFormat } from '@entities/language/LanguageTypes';

import { PageBrightness, usePageBrightness } from '@shared/hooks/usePageBrightness';

import useStoredParams from './useStoredParams';

export enum LocaleSeparator {
  Underscore = '_',
  Hyphen = '-',
}

export type LocalStorageParams = {
  localeSeparator: LocaleSeparator;
  brightness: PageBrightness;
  languageCodeFormat: LanguageCodeFormat;

  setLocaleSeparator: (value: LocaleSeparator) => void;
  setLanguageCodeFormat: (value: LanguageCodeFormat) => void;
};

/** These parameters are saved in local storage and persist between sessions */
const useLocalStorageParams = (): LocalStorageParams => {
  const pageBrightness = usePageBrightness();
  const { value: localeSeparator, setValue: setLocaleSeparator } = useStoredParams<LocaleSeparator>(
    'localeSeparator',
    LocaleSeparator.Underscore,
    'local',
  );
  const { value: languageCodeFormat, setValue: setLanguageCodeFormat } =
    useStoredParams<LanguageCodeFormat>('languageCodeFormat', LanguageCodeFormat.Unset, 'local');

  return {
    localeSeparator,
    setLocaleSeparator,
    brightness: pageBrightness.pageBrightness,
    languageCodeFormat,
    setLanguageCodeFormat,
  };
};

export default useLocalStorageParams;
