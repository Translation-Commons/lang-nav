import { describe, it, expect, vi } from 'vitest';

import { getBaseLanguageData } from '../LanguageTypes';

import {
  convertStringRulesToRuleDeterminer,
  expandPluralExamples,
  findLanguagePluralRules,
  getVariableFromNumberOrString,
  PluralRuleKey,
} from './LanguagePluralComputation';

// Mock the CLDR plurals JSON before importing the module under test
vi.mock('cldr-core/supplemental/plurals.json', () => {
  return {
    default: {
      // Plural rules copied from v47 of CLDR
      supplemental: {
        'plurals-type-cardinal': {
          // English: has "one" and "other"
          en: {
            'pluralRule-count-one': 'i = 1 and v = 0 @integer 1',
            'pluralRule-count-other':
              ' @integer 0, 2~16, 100, 1000, 10000, 100000, 1000000, … @decimal 0.0~1.5, 10.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …',
          },

          // Chinese: does not distinguish plural forms
          zh: {
            'pluralRule-count-other':
              ' @integer 0~15, 100, 1000, 10000, 100000, 1000000, … @decimal 0.0~1.5, 10.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …',
          },

          // French: has one and "other" -- but also "many" for some large numbers
          fr: {
            'pluralRule-count-one': 'i = 0,1 @integer 0, 1 @decimal 0.0~1.5',
            'pluralRule-count-many':
              'e = 0 and i != 0 and i % 1000000 = 0 and v = 0 or e != 0..5 @integer 1000000, 1c6, 2c6, 3c6, 4c6, 5c6, 6c6, … @decimal 1.0000001c6, 1.1c6, 2.0000001c6, 2.1c6, 3.0000001c6, 3.1c6, …',
            'pluralRule-count-other':
              ' @integer 2~17, 100, 1000, 10000, 100000, 1c3, 2c3, 3c3, 4c3, 5c3, 6c3, … @decimal 2.0~3.5, 10.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, 1.0001c3, 1.1c3, 2.0001c3, 2.1c3, 3.0001c3, 3.1c3, …',
          },

          // Russian supports dual and paucal forms
          ru: {
            'pluralRule-count-one':
              'v = 0 and i % 10 = 1 and i % 100 != 11 @integer 1, 21, 31, 41, 51, 61, 71, 81, 101, 1001, …',
            'pluralRule-count-few':
              'v = 0 and i % 10 = 2..4 and i % 100 != 12..14 @integer 2~4, 22~24, 32~34, 42~44, 52~54, 62, 102, 1002, …',
            'pluralRule-count-many':
              'v = 0 and i % 10 = 0 or v = 0 and i % 10 = 5..9 or v = 0 and i % 100 = 11..14 @integer 0, 5~19, 100, 1000, 10000, 100000, 1000000, …',
            'pluralRule-count-other':
              '   @decimal 0.0~1.5, 10.0, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …',
          },

          // Arabic has a very complex arrangement
          ar: {
            'pluralRule-count-zero': 'n = 0 @integer 0 @decimal 0.0, 0.00, 0.000, 0.0000',
            'pluralRule-count-one': 'n = 1 @integer 1 @decimal 1.0, 1.00, 1.000, 1.0000',
            'pluralRule-count-two': 'n = 2 @integer 2 @decimal 2.0, 2.00, 2.000, 2.0000',
            'pluralRule-count-few':
              'n % 100 = 3..10 @integer 3~10, 103~110, 1003, … @decimal 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0, 103.0, 1003.0, …',
            'pluralRule-count-many':
              'n % 100 = 11..99 @integer 11~26, 111, 1011, … @decimal 11.0, 12.0, 13.0, 14.0, 15.0, 16.0, 17.0, 18.0, 111.0, 1011.0, …',
            'pluralRule-count-other':
              ' @integer 100~102, 200~202, 300~302, 400~402, 500~502, 600, 1000, 10000, 100000, 1000000, … @decimal 0.1~0.9, 1.1~1.7, 10.1, 100.0, 1000.0, 10000.0, 100000.0, 1000000.0, …',
          },
        },
      },
    },
  };
});

describe('findLanguagePluralRules', () => {
  it('returns plural rules for a language', () => {
    const lang = getBaseLanguageData('en', 'English');

    const rules = findLanguagePluralRules(lang);
    const conditions = rules?.map(([key, rule]) => [key, rule.split('@')[0].trim()]); // Simplify for test comparison
    expect(conditions).not.toBeNull();
    expect(conditions).toEqual([
      [PluralRuleKey.One, 'i = 1 and v = 0'],
      [PluralRuleKey.Other, ''],
    ]);
  });

  it('returns plural rules for a language using codeISO6391', () => {
    const lang = getBaseLanguageData('fra', 'French');
    lang.codeISO6391 = 'fr';

    const rules = findLanguagePluralRules(lang);
    const conditions = rules?.map(([key, rule]) => [key, rule.split('@')[0].trim()]); // Simplify for test comparison
    expect(conditions).not.toBeNull();
    expect(conditions).toEqual([
      [PluralRuleKey.One, 'i = 0,1'],
      [PluralRuleKey.Many, 'e = 0 and i != 0 and i % 1000000 = 0 and v = 0 or e != 0..5'],
      [PluralRuleKey.Other, ''],
    ]);
  });

  it('falls back to CLDR sourceSpecific code when codeISO6391 is missing and filters out empty rules', () => {
    const lang = getBaseLanguageData('cmn', 'Mandarin');
    lang.sourceSpecific.CLDR.code = 'zh'; // CLDR treats 'zh' as the code for Mandarin

    const rules = findLanguagePluralRules(lang);
    const conditions = rules?.map(([key, rule]) => [key, rule.split('@')[0].trim()]); // Simplify for test comparison
    expect(conditions).not.toBeNull();
    // Only the non-empty 'one' rule should be returned for 'fr'
    expect(conditions).toEqual([[PluralRuleKey.Other, '']]);
  });

  it('languages without plural rules return null', () => {
    const lang = getBaseLanguageData('jpn', 'Japanese'); // Japanese misssing from test set
    lang.codeISO6391 = 'ja';

    const rules = findLanguagePluralRules(lang);
    expect(rules).toBeNull();
  });
});

describe('convertStringRulesToRuleDeterminer', () => {
  it('correctly determines plural rules for English', () => {
    const lang = getBaseLanguageData('en', 'English');
    const rules = findLanguagePluralRules(lang)!;
    const getPluralRule = convertStringRulesToRuleDeterminer(rules);

    expect(getPluralRule(1)).toBe(PluralRuleKey.One);
    expect(getPluralRule(2)).toBe(PluralRuleKey.Other);
    expect(getPluralRule(0)).toBe(PluralRuleKey.Other);
    expect(getPluralRule(1.5)).toBe(PluralRuleKey.Other);
  });
  it('correctly determines plural rules for Russian', () => {
    const lang = getBaseLanguageData('ru', 'Russian');
    const rules = findLanguagePluralRules(lang)!;
    const getPluralRule = convertStringRulesToRuleDeterminer(rules);

    expect(getPluralRule(1)).toBe(PluralRuleKey.One);
    expect(getPluralRule(21)).toBe(PluralRuleKey.One);
    expect(getPluralRule(2)).toBe(PluralRuleKey.Few);
    expect(getPluralRule(4)).toBe(PluralRuleKey.Few);
    expect(getPluralRule(22)).toBe(PluralRuleKey.Few);
    expect(getPluralRule(5)).toBe(PluralRuleKey.Many);
    expect(getPluralRule(11)).toBe(PluralRuleKey.Many);
    expect(getPluralRule(0)).toBe(PluralRuleKey.Many);
    expect(getPluralRule(1.5)).toBe(PluralRuleKey.Other);
  });

  it('correctly determines the plural rules for all examples', () => {
    // For the languages in our test set, verify that all example numbers in the CLDR rules map to the correct plural rule
    const langs = ['en', 'fr', 'ru', 'zh', 'ar'].map((code) => getBaseLanguageData(code, code));
    langs.forEach((lang) => {
      // Extract the rules and evaluate each rule separately
      const rules = findLanguagePluralRules(lang)!;
      const getPluralRule = convertStringRulesToRuleDeterminer(rules);

      // For each rule, check all example numbers
      rules.forEach(([ruleKey, ruleStr]) => {
        // Check example integers from the rule string (if provided)
        const integerExamplesMatch = ruleStr.match(/@integer ([\d\s.,~c]+)/)?.[1];
        if (integerExamplesMatch) {
          const examples = expandPluralExamples(integerExamplesMatch);
          examples.forEach((exampleNum) => {
            const determinedRule = getPluralRule(exampleNum);
            expect(
              determinedRule,
              `Failed for language ${lang.codeDisplay} with ${exampleNum} for rule ${ruleKey}`,
            ).toBe(ruleKey);
          });
        }

        // Check example decimals from the rule string (if provided)
        const decimalExamplesMatch = ruleStr.match(/@decimal ([\d\s.,~c]+)/)?.[1];
        if (decimalExamplesMatch) {
          const examples = expandPluralExamples(decimalExamplesMatch, 1);
          examples.forEach((exampleNum) => {
            const determinedRule = getPluralRule(exampleNum);
            expect(
              determinedRule,
              `Failed for language ${lang.codeDisplay} with ${exampleNum} for rule ${ruleKey}`,
            ).toBe(ruleKey);
          });
        }
      });
    });
  });
});

describe('getVariableFromNumberOrString', () => {
  it('correctly extract the absolute value of the number', () => {
    expect(getVariableFromNumberOrString('n', 1)).toBe(1);
    expect(getVariableFromNumberOrString('n', '1.5')).toBe(1.5);
    expect(getVariableFromNumberOrString('n', '1e3')).toBe(1000);
    expect(getVariableFromNumberOrString('n', '1.2e3')).toBe(1200);
    expect(getVariableFromNumberOrString('n', '1.00001e6')).toBe(1000010);
  });
});

describe('expandPluralExamples', () => {
  it('expands simple comma-separated examples', () => {
    const examples = expandPluralExamples('0, 1, 2, 3');
    expect(examples).toEqual(['0', '1', '2', '3']);
  });

  it('expands ranges with ~', () => {
    const examples = expandPluralExamples('0~3');
    expect(examples).toEqual(['0', '1', '2', '3']);
  });

  it('keeps c notation for powers of ten', () => {
    const examples = expandPluralExamples('1c3, 2c3');
    expect(examples).toEqual(['1c3', '2c3']);
  });

  it('handles decimal examples', () => {
    const examples = expandPluralExamples('0.0~0.3, 1.5, 2.0', 1);
    expect(examples).toEqual(['0.0', '0.1', '0.2', '0.3', '1.5', '2.0']);
  });
});

describe('getVariableFromNumberOrString', () => {
  it('correctly extract the absolute value of the number', () => {
    expect(getVariableFromNumberOrString('n', 1)).toBe(1);
    expect(getVariableFromNumberOrString('n', '1.5')).toBe(1.5);
    expect(getVariableFromNumberOrString('n', '1e3')).toBe(1000);
    expect(getVariableFromNumberOrString('n', '1.2e3')).toBe(1200);
    expect(getVariableFromNumberOrString('n', '1.00001e6')).toBe(1000010);
    expect(getVariableFromNumberOrString('n', '1.0000101e6')).toBe(1000010.1);
  });

  it('correctly extract integer variables', () => {
    expect(getVariableFromNumberOrString('i', '1.5')).toBe(1);
    expect(getVariableFromNumberOrString('i', '123.456')).toBe(123);
    expect(getVariableFromNumberOrString('i', '1.2e3')).toBe(1200);
    expect(getVariableFromNumberOrString('i', '1.00001e6')).toBe(1000010);
    expect(getVariableFromNumberOrString('i', '1.0000101e6')).toBe(1000010);
  });

  it('correctly extract visible fraction digits with trailing zeros', () => {
    expect(getVariableFromNumberOrString('v', '1.50')).toBe(2);
    expect(getVariableFromNumberOrString('v', '1.5')).toBe(1);
    expect(getVariableFromNumberOrString('v', '123.45600')).toBe(5);
    expect(getVariableFromNumberOrString('v', '1.2e3')).toBe(0);
    expect(getVariableFromNumberOrString('v', '1.00001e6')).toBe(0);
    expect(getVariableFromNumberOrString('v', '1.0000108e6')).toBe(1);
  });

  it('correctly extract visible fraction digits without trailing zeros', () => {
    expect(getVariableFromNumberOrString('w', '1.50')).toBe(1);
    expect(getVariableFromNumberOrString('w', '1.5')).toBe(1);
    expect(getVariableFromNumberOrString('w', '123.45600')).toBe(3);
    expect(getVariableFromNumberOrString('w', '1.2e3')).toBe(0);
    expect(getVariableFromNumberOrString('w', '1.00001e6')).toBe(0);
    expect(getVariableFromNumberOrString('w', '1.0000108e6')).toBe(1);
  });

  it('correctly extract visible fraction digits as integer with trailing zeros', () => {
    expect(getVariableFromNumberOrString('f', '1.50')).toBe(50);
    expect(getVariableFromNumberOrString('f', '1.5')).toBe(5);
    expect(getVariableFromNumberOrString('f', '123.45600')).toBe(45600);
    expect(getVariableFromNumberOrString('f', '1.2e3')).toBe(0);
    expect(getVariableFromNumberOrString('f', '1.00001e6')).toBe(0);
    expect(getVariableFromNumberOrString('i', '1.0000108e6')).toBe(8);
  });

  it('correctly extract visible fraction digits as integer without trailing zeros', () => {
    expect(getVariableFromNumberOrString('t', '1.50')).toBe(5);
    expect(getVariableFromNumberOrString('t', '1.5')).toBe(5);
    expect(getVariableFromNumberOrString('t', '123.45600')).toBe(456);
    expect(getVariableFromNumberOrString('t', '1.2e3')).toBe(0);
    expect(getVariableFromNumberOrString('t', '1.00001e6')).toBe(0);
    expect(getVariableFromNumberOrString('t', '1.0000108e6')).toBe(8);
  });

  it('correctly extract compact decimal exponent value', () => {
    expect(getVariableFromNumberOrString('c', '1.5')).toBe(0);
    expect(getVariableFromNumberOrString('c', '1.5c3')).toBe(3);
    expect(getVariableFromNumberOrString('c', '1.5e4')).toBe(4);
    expect(getVariableFromNumberOrString('c', '1.00001e6')).toBe(6);
    expect(getVariableFromNumberOrString('c', '1.0000108e6')).toBe(6);
  });
});
