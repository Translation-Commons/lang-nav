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
      return 'var(--color-blue)';
    case PluralRuleKey.One:
      return 'var(--color-green)';
    case PluralRuleKey.Two:
      return 'var(--color-yellow)';
    case PluralRuleKey.Few:
      return 'var(--color-orange)';
    case PluralRuleKey.Many:
      return 'var(--color-red)';
    case PluralRuleKey.Other:
      return 'var(--color-button-secondary)';
  }
}
