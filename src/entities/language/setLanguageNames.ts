import { unique } from '@shared/lib/setUtils';

import { LanguageData, LanguageSource } from './LanguageTypes';

export function setLanguageNames(lang: LanguageData, additionalNames: string[] = []): void {
  const names = [
    lang.nameCanonical,
    lang.nameEndonym,
    ...Object.values(LanguageSource).map((src) => lang[src].name),
    ...lang.names,
    ...additionalNames,
  ].filter((s) => s != null);

  // Remove parentheticals if its a standard for an alternative language name
  // eg. ["Mandarin", "Putonghua (Mandarin)"] -> ["Mandarin", "Putonghua"]
  // but keep if its is an elaboration eg. ["Cantonese", "Cantonese (inc. Teochew, Taiwanese)"]
  const namesRemovingParentheticalDuplicates = unique(
    names.map((name) => {
      const [preParens, inParens] = name.split(/\(|\)/);
      if (
        inParens &&
        (names.includes(inParens.trim()) || inParens === 'macrolanguage' || inParens === 'family')
      )
        return preParens.trim();
      return name;
    }),
  );

  // Set the value
  lang.names = namesRemovingParentheticalDuplicates;
}
