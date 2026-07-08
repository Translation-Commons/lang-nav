import { LanguageModality } from '@entities/language/LanguageModality';

import enforceExhaustiveSwitch from '@shared/lib/enforceExhaustiveness';

export function getModalityLabel(modality: LanguageModality | undefined): string | undefined {
  if (modality == null) return undefined;
  switch (modality) {
    case LanguageModality.Written:
      return 'Written';
    case LanguageModality.MostlyWritten:
      return 'Mostly Written';
    case LanguageModality.SpokenAndWritten:
      return 'Spoken & Written';
    case LanguageModality.MostlySpoken:
      return 'Mostly Spoken';
    case LanguageModality.Spoken:
      return 'Spoken';
    case LanguageModality.Sign:
      return 'Sign';
  }
}

export function getModalityFromLabel(label: string | undefined): LanguageModality | undefined {
  if (label == null || label === '') return undefined;
  switch (label.trim()) {
    case 'Written':
      return LanguageModality.Written;
    case 'Mostly Written':
      return LanguageModality.MostlyWritten;
    case 'Spoken & Written':
    case 'Spoken and Written':
      return LanguageModality.SpokenAndWritten;
    case 'Mostly Spoken':
      return LanguageModality.MostlySpoken;
    case 'Spoken':
      return LanguageModality.Spoken;
    case 'Sign':
      return LanguageModality.Sign;
  }
  return undefined;
}

export function getLanguageModalityDescription(modality: LanguageModality): string {
  switch (modality) {
    case LanguageModality.Written:
      return 'This language exists in a written form in modern times.';
    case LanguageModality.MostlyWritten:
      return 'This language is mostly written, but also has a spoken form.';
    case LanguageModality.SpokenAndWritten:
      return 'This language is actively spoken and written.';
    case LanguageModality.MostlySpoken:
      return 'This language is mostly spoken, but is sometimes used for writing.';
    case LanguageModality.Spoken:
      return 'This language is primarily spoken, it is rarely used in writing.';
    case LanguageModality.Sign:
      return 'This language is a sign language.';
  }
}

export function getLanguageModalityUserLabel(
  modality: LanguageModality | undefined,
  plural: boolean = true,
): string {
  if (modality == null) return plural ? 'speakers' : 'speaker';
  switch (modality) {
    case LanguageModality.Spoken:
    case LanguageModality.MostlySpoken:
    case LanguageModality.SpokenAndWritten:
      return plural ? 'speakers' : 'speaker';
    case LanguageModality.Sign:
      return plural ? 'signers' : 'signer';
    case LanguageModality.MostlyWritten:
    case LanguageModality.Written:
      return plural ? 'writers' : 'writer';
    default:
      enforceExhaustiveSwitch(modality);
  }
}
