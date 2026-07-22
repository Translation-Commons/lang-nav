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
