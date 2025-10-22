// Explanation of how to parse plural rules can be found here:
// https://unicode.org/reports/tr35/tr35-numbers.html?#Operands
import plurals from 'cldr-core/supplemental/plurals.json';

import { LanguageData } from '../LanguageTypes';

export enum PluralRuleKey {
  Zero = 'pluralRule-count-zero',
  One = 'pluralRule-count-one',
  Two = 'pluralRule-count-two',
  Few = 'pluralRule-count-few',
  Many = 'pluralRule-count-many',
  Other = 'pluralRule-count-other',
}

export type PluralRuleFromCLDR = [PluralRuleKey, string];

export function findLanguagePluralRules(lang: LanguageData): PluralRuleFromCLDR[] | null {
  // Find the plural rules for this language
  const allPluralRules = plurals.supplemental['plurals-type-cardinal'];
  const lookupID = lang.codeISO6391 ?? lang.ID;

  const pluralRules =
    (Object.entries(allPluralRules).find(([language]) => language === lookupID)?.[1] as
      | Record<string, string>
      | undefined) ?? {};

  return Object.values(PluralRuleKey).reduce((acc, key) => {
    if (key in pluralRules) acc.push([key, pluralRules[key] ?? null]);
    return acc;
  }, [] as PluralRuleFromCLDR[]);
}

export function convertStringRulesToRuleDeterminer(
  rules: PluralRuleFromCLDR[],
): (num: number, fixedDecimalDigits: number) => PluralRuleKey | undefined {
  // Make binary functions that check numbers against each rule
  const ruleFunctions: [
    PluralRuleKey,
    (num: number, fixedDecimalDigits: number) => boolean | undefined,
  ][] = rules.map(([key, rule]) => [key as PluralRuleKey, getPluralRuleFunction(rule)]);

  // Return function that finds the first matching rule
  return (num: number, fixedDecimalDigits: number): PluralRuleKey | undefined => {
    for (const [ruleKey, ruleFunc] of ruleFunctions) {
      if (ruleFunc(num, fixedDecimalDigits)) return ruleKey;
    }
    return undefined;
  };
}

function getPluralRuleFunction(
  rule: string,
): (num: number, fixedDecimalDigits: number) => boolean | undefined {
  // Convert the rule string into a function that takes a number and returns a boolean
  // Example rule 1: "i = 0 and v = 0 @integer 0"
  // Example rule 2: n % 10 = 1 and n % 100 != 11,71,91 @integer 1, 21, 31, 41, 51, 61, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 81.0, 101.0, 1001.0, …

  // #1 drop the @integer/@decimal part (those are just examples)
  const ruleInitial = rule.split('@')[0].trim();
  if (ruleInitial === '') return () => true;

  // Precompute condition functions so we don't recreate them on every call
  const orConditionFuncs: ((num: number, fixedDecimalDigits: number) => boolean | undefined)[][] =
    ruleInitial
      .split(' or ') // #2 split on 'or' conditions
      .map((orCond) =>
        // #3 split on 'and' conditions
        orCond.split(' and ').map((andCond) => getConditionFunction(andCond.trim())),
      );

  return (num: number, fixedDecimalDigits: number): boolean =>
    orConditionFuncs.some((andFuncs) =>
      andFuncs.every((fn) => fn(num, fixedDecimalDigits) === true),
    );
}

function getConditionFunction(
  cond: string,
): (num: number, fixedDecimalDigits: number) => boolean | undefined {
  // Examples:
  //   i = 0
  //   v = 0
  //   n % 10 = 1
  //   n % 100 != 11,71,91

  // #4 parse each condition into multiple pieces
  const [variable, modulo, operator, values] =
    cond.match(/([nivwftce])(?: % (\d+))? (=|!=) (.+)/)?.slice(1) ?? [];
  if (!variable || !operator || !values) {
    console.error('Failed to parse plural rule condition:', cond);
    return () => undefined;
  }

  // #5 parse the "values" string into something that can compare against numbers
  const valueMatch = (num: number): boolean => {
    if (values.includes('..')) {
      const [startStr, endStr] = values.split('..');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      return num >= start && num <= end;
    }
    const valueList = values.split(',');
    return valueList.includes(String(num));
  };

  // #6 check if the input number matches the condition
  return (num, fixedDecimalDigits) =>
    doesInputNumberMatchParsedCondition(
      num,
      fixedDecimalDigits,
      variable,
      valueMatch,
      modulo ? parseInt(modulo) : undefined,
    ) ===
    // #7 if the operator is "=" then stay normal, but if "!=" then invert
    (operator === '=');
}

// Table: Plural Operand Meanings
// Symbol	Value
// n	the absolute value of N.*
// i	the integer digits of N.*
// v	the number of visible fraction digits in N, with trailing zeros.*
// w	the number of visible fraction digits in N, without trailing zeros.*
// f	the visible fraction digits in N, with trailing zeros, expressed as an integer.*
// t	the visible fraction digits in N, without trailing zeros, expressed as an integer.*
// c	compact decimal exponent value: exponent of the power of 10 used in compact decimal formatting.
// e	a deprecated synonym for ‘c’. Note: it may be redefined in the future.
function doesInputNumberMatchParsedCondition(
  num: number,
  fixedDecimalDigits: number | undefined, // forces trailing zeros eg. "1.50" has v=2
  variable: string,
  valueMatch: (n: number) => boolean,
  modulo: number | undefined,
): boolean | undefined {
  const nStr = String(num);
  const [integerPart, fractionPart] = nStr.split('.') as [string, string | undefined];
  const integerDigits = integerPart.length;
  const fractionDigits = fractionPart?.length || 0;
  const fractionDigitsWithTrailingZeros = Math.max(fixedDecimalDigits || 0, fractionDigits);

  switch (variable) {
    case 'n': // the absolute value of N.*
      return valueMatch(modulo ? num % modulo : num);
    case 'i': // the integer digits of N.*
      return valueMatch(modulo ? integerDigits % modulo : integerDigits);
    case 'v': // the number of visible fraction digits in N, with trailing zeros.*
      return valueMatch(
        modulo ? fractionDigitsWithTrailingZeros % modulo : fractionDigitsWithTrailingZeros,
      );
    case 'w': // the number of visible fraction digits in N, without trailing zeros.*
      return valueMatch(modulo ? fractionDigits % modulo : fractionDigits);
    case 'f': // the visible fraction digits in N, with trailing zeros, expressed as an integer.*
      // const fStr = (nStr.split('.')[1] ?? '').padEnd((nStr.split('.')[1] ?? '').length, '0');
      // const f = fStr === '' ? 0 : parseInt(fStr, 10);
      // return valueMatch(f) === (operator === '=');
      return undefined; // f not handled
    case 't': //undefinedthe visible fraction digits in N, without trailing zeros, expressed as an integer.*
      // const tStr = (nStr.split('.')[1] ?? '').replace(/0+$/, '');
      // const t = tStr === '' ? 0 : parseInt(tStr, 10);
      // return valueMatch(t) === (operator === '=');
      return undefined; // t not handled
    case 'c': //undefinedcompact decimal exponent value: exponent of the power of 10 used in compact decimal formatting.
    case 'e': // a deprecated synonym for ‘c’. Note: it may be redefined in the future.
      // Compact decimal exponent not handled
      return undefined;
    default:
      return undefined;
  }
}
