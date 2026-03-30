import { VariantType } from '@entities/variant/VariantTypes';

export function getVariantTypeFromString(input: string): VariantType | undefined {
  switch (input.trim().toLowerCase()) {
    case 'orthographic':
    case 'o':
      return VariantType.Orthographic;
    case 'dialect':
    case 'd':
      return VariantType.Dialect;
  }
  return undefined;
}

export function getVariantTypeDisplay(variantType: VariantType): string {
  switch (variantType) {
    case VariantType.Orthographic:
      return 'Orthographic';
    case VariantType.Dialect:
      return 'Dialect';
  }
}

export function getVariantTypeDescription(variantType: VariantType): string {
  switch (variantType) {
    case VariantType.Orthographic:
      return 'This variant is about how the language is written, such as different spelling conventions or transliteration standards.';
    case VariantType.Dialect:
      return 'This variant represents a cultural and/or historical variation of the language with distinct word choice, pronunciation, or grammar.';
  }
}
