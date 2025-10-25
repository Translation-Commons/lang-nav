import { PluralRuleKey } from './LanguagePluralComputation';

export function getPluralRuleKeyLabel(key: PluralRuleKey): string {
  switch (key) {
    case PluralRuleKey.Zero:
      return 'Zero';
    case PluralRuleKey.One:
      return 'One';
    case PluralRuleKey.Two:
      return 'Two';
    case PluralRuleKey.Few:
      return 'Few';
    case PluralRuleKey.Many:
      return 'Many';
    case PluralRuleKey.Other:
      return 'Other';
  }
}

export function getPluralRuleColor(key: PluralRuleKey): string {
  switch (key) {
    case PluralRuleKey.Zero:
      return 'var(--color-text-blue)';
    case PluralRuleKey.One:
      return 'var(--color-text-green)';
    case PluralRuleKey.Two:
      return 'var(--color-text-yellow)';
    case PluralRuleKey.Few:
      return 'var(--color-text-orange)';
    case PluralRuleKey.Many:
      return 'var(--color-text-red)';
    case PluralRuleKey.Other:
      return 'var(--color-button-secondary)';
  }
}
