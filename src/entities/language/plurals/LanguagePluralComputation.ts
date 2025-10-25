// Explanation of how to parse plural rules can be found here:
// https://unicode.org/reports/tr35/tr35-numbers.html?#Language_Plural_Rules
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

export type PluralRuleDeterminer = (num: number | string) => PluralRuleKey | undefined;
type PluralRulePassesFunction = (num: number | string) => boolean | undefined;

export function findLanguagePluralRules(lang: LanguageData): PluralRuleFromCLDR[] | null {
  // Find the plural rules for this language. Casting to general strings because CLDR typings from input are too precise
  const pluralRulesUntyped = plurals.supplemental['plurals-type-cardinal'] as Record<
    string,
    Record<string, string>
  >;
  const lookupID = lang.codeISO6391 ?? lang.ID;
  const lookupIDAlt = lang.sourceSpecific.CLDR?.code;

  // Get plural rules
  const pluralRules = pluralRulesUntyped[lookupID] || pluralRulesUntyped[lookupIDAlt ?? ''];
  if (!pluralRules) return null;

  // Convert to array with stable key order
  return Object.values(PluralRuleKey)
    .map((key) => [key, pluralRules[key]!] as PluralRuleFromCLDR)
    .filter(([, rule]) => rule && rule.length > 0);
}

export function convertStringRulesToRuleDeterminer(
  rules: PluralRuleFromCLDR[],
): PluralRuleDeterminer {
  // Make binary functions that check numbers against each rule
  const ruleFunctions: [PluralRuleKey, PluralRulePassesFunction][] = rules.map(([key, rule]) => [
    key as PluralRuleKey,
    getPluralRuleFunction(rule),
  ]);

  // Return function that finds the first matching rule
  return (num: number | string): PluralRuleKey | undefined =>
    ruleFunctions.find(([, ruleFunc]) => ruleFunc(num))?.[0];
}

function getPluralRuleFunction(rule: string): PluralRulePassesFunction {
  // Convert the rule string into a function that takes a number and returns a boolean
  // Example rule 1: "i = 0 and v = 0 @integer 0"
  // Example rule 2: n % 10 = 1 and n % 100 != 11,71,91 @integer 1, 21, 31, 41, 51, 61, 81, 101, 1001, … @decimal 1.0, 21.0, 31.0, 41.0, 51.0, 61.0, 81.0, 101.0, 1001.0, …

  // #1 drop the @integer/@decimal part (those are just examples)
  const equations = rule.split('@')[0].trim();
  if (equations === '') return () => true;

  // Precompute condition functions so we don't recreate them on every call
  const orConditionFuncs: PluralRulePassesFunction[][] = equations
    .split(' or ') // #2 split on 'or' conditions
    .map((orCond) =>
      // #3 split on 'and' conditions
      orCond.split(' and ').map((andCond) => getConditionFunction(andCond.trim())),
    );

  return (num: number | string): boolean =>
    orConditionFuncs.some((andFuncs) => andFuncs.every((fn) => fn(num) === true));
}

export function getConditionFunction(cond: string): PluralRulePassesFunction {
  // Examples:
  //   i = 0
  //   v = 0
  //   n % 10 = 1
  //   n % 100 != 11,71,91

  // #4 parse each condition into multiple pieces
  const [symbol, modulo, operator, values] =
    cond.match(/([nivwftce])(?: % (\d+))? (=|!=) (.+)/)?.slice(1) ?? [];
  if (!symbol || !operator || !values) {
    console.error('Failed to parse plural rule condition:', cond);
    return () => undefined;
  }

  // #5 parse the "values" string into something that can compare against numbers
  const valueMatch = (num: number): boolean => {
    if (values.includes('..')) {
      const [startStr, endStr] = values.split('..');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      return start <= num && num <= end;
    }
    const valueList = values.split(',');
    return valueList.includes(String(num));
  };

  // #6 check if the input number matches the condition
  return (num: number | string) =>
    valueMatch(
      modulo
        ? getVariableFromNumberOrString(symbol, num) % parseInt(modulo)
        : getVariableFromNumberOrString(symbol, num),
    ) ===
    // #7 if the operator is "=" then stay normal, but if "!=" then invert
    (operator === '=');
}

/**
 * Some variables passed may be variables with some formatting already, eg. "1.50", "1.2e3", "2c6".
 * Thereby, we need to extract information from them first.
 */
export function getVariableFromNumberOrString(symbol: string, num: number | string): number {
  // Not necessary if the imput is already a number
  if (typeof num === 'number') return getVariableFromNumber(symbol, num, 0, 0);

  // If its a string, extract relevant parts
  let trailingZeros = num.split('.')[1]?.length || 0;
  const compactExponent = parseInt(num.split(/e|c/)[1]) || 0;
  let numAsNumber = parseFloat(num);
  if (compactExponent) {
    // Don't immediately use parseFloat because it is too imprecise in JS, rather move the period in the string then parse
    const [integerPart, fractionPart = ''] = num.split('e')[0].split('.');
    numAsNumber = parseInt(integerPart) * Math.pow(10, compactExponent);
    if (fractionPart.length === 0) {
      // add nothing
    } else if (fractionPart.length > compactExponent) {
      numAsNumber += parseInt(fractionPart.slice(0, compactExponent));
      numAsNumber += parseFloat('0.' + fractionPart.slice(compactExponent));
    } else {
      numAsNumber += parseInt(fractionPart) * Math.pow(10, compactExponent - fractionPart.length);
    }
    // Recompute trailing zeros since the decimal point has moved
    trailingZeros = String(numAsNumber).split('.')[1]?.length || 0;
  }

  if (num === '1.000001e6') {
    console.log(
      symbol,
      num,
      trailingZeros,
      compactExponent,
      numAsNumber,
      getVariableFromNumber(symbol, numAsNumber, trailingZeros, compactExponent),
    );
  }
  return getVariableFromNumber(symbol, numAsNumber, trailingZeros, compactExponent);
}

function getVariableFromNumber(
  symbol: string,
  num: number,
  trailingZeros: number, // eg. "1.50" has 1, "1.5" has 0
  compactExponent: number, // e.g. "1.2345e3" has e = 3, "1234.5" has e = 0
): number {
  switch (symbol) {
    case 'n': // the absolute value of N
      return Math.abs(num);
    case 'i': // the integer digits of N
      return Math.abs(Math.trunc(num));
    case 'v': // the number of visible fraction digits in N, with trailing zeros.
      return (String(num).split('.')[1]?.length ?? 0) + trailingZeros;
    case 'w': // the number of visible fraction digits in N, without trailing zeros.
      return String(num).split('.')[1]?.length ?? 0;
    case 'f': // the visible fraction digits in N, with trailing zeros, expressed as an integer.
      return parseInt(String(num).split('.')[1]?.padEnd(trailingZeros, '0')) || 0;
    case 't': // the visible fraction digits in N, without trailing zeros, expressed as an integer.
      return parseInt(String(num).split('.')[1]) || 0;
    case 'c': // compact decimal exponent value: exponent of the power of 10 used in compact decimal formatting.
    case 'e': // a deprecated synonym for ‘c’. Note: it may be redefined in the future.
      return compactExponent; // e.g. e = 3 for 1.2345e3, e = 0 for 1234.5
    default:
      return 0;
  }
}

export function expandPluralExamples(
  examples: string,
  decimalDigits?: number,
): (number | string)[] {
  // Expand compressed example lists like "0, 1, 2~4, 1.0, 3c6" into full arrays
  return examples
    .split(',')
    .map((part) => part.trim())
    .flatMap((part): string | string[] => {
      if (part.includes('…') || part.length === 0) return []; // skip ellipsis
      if (part.includes('~')) {
        const [startStr, endStr] = part.split('~');
        const start = parseFloat(startStr);
        const end = parseFloat(endStr);
        const step = decimalDigits && decimalDigits > 0 ? Math.pow(10, -decimalDigits) : 1;
        return Array.from({ length: Math.floor((end - start) / step) + 1 }, (_, i) =>
          (start + i * step).toFixed(decimalDigits),
        );
      }
      return part; // Leave as string to keep floating zeros and exponential format
    });
}
