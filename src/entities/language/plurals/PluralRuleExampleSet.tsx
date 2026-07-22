import React from 'react';

import { parsePluralRuleEquation } from './pluralRuleParsing';

type Props = {
  rule: string;
  exampleSet: 'integer' | 'decimal';
};

const PluralRuleExampleSet: React.FC<Props> = ({ rule, exampleSet }) => {
  const { integerExamples, decimalExamples } = parsePluralRuleEquation(rule);

  if (exampleSet === 'decimal' && decimalExamples) {
    return replaceCompactNotationInExamples(decimalExamples);
  }
  return integerExamples ? replaceCompactNotationInExamples(integerExamples) : '';
};

function replaceCompactNotationInExamples(numSequenceString: string): string {
  return numSequenceString.trim().split(', ').map(replaceCompactNotation).join(', ');
}

function replaceCompactNotation(num: string): string {
  if (num.includes('~')) {
    const parts = num.split('~');
    return replaceCompactNotation(parts[0]) + ' to ' + replaceCompactNotation(parts[1]);
  }

  // Compact notation, eg. "1c4" = "10 thousand"
  if (num.includes('c')) {
    const parts = num.split('c');
    const exponent = parseInt(parts[1], 10);
    let base = parts[0];

    if (exponent == 2) return base + ' hundred';

    // Adjust the base, so the "1" in "1e4" becomes "10" to result with "10 thousand".
    if (exponent % 3 === 1) {
      base = (parseFloat(base) * 10).toString();
    } else if (exponent % 3 === 2) {
      base = (parseFloat(base) * 100).toString();
    }
    // For now only supporting English compact numbers for examples
    if (exponent >= 3 && exponent < 6) {
      return base + ' thousand';
    } else if (exponent >= 6 && exponent < 9) {
      return base + ' million';
    } else if (exponent >= 9 && exponent < 12) {
      return base + ' billion';
    } else if (exponent >= 12 && exponent < 15) {
      return base + ' trillion';
    }
    return num; // not supported
  }
  return num;
}

export default PluralRuleExampleSet;
