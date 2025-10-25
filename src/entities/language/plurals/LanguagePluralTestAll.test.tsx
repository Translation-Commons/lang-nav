import { describe } from 'node:test';

import plurals from 'cldr-core/supplemental/plurals.json';
import { expect, it } from 'vitest';

import { getBaseLanguageData } from '../LanguageTypes';

import {
  convertStringRulesToRuleDeterminer,
  expandPluralExamples,
  findLanguagePluralRules,
} from './LanguagePluralComputation';

describe('convertStringRulesToRuleDeterminer', () => {
  it('correctly determines the plural rules for all examples', () => {
    // Find all of the languages in plurals.json
    const languageCodes = Object.keys(plurals.supplemental['plurals-type-cardinal']);
    const langs = languageCodes.map((code) => getBaseLanguageData(code, code));

    // Test the languages
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
