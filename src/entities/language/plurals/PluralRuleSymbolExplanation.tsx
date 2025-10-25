import React from 'react';

import { getVariableFromNumberOrString } from './LanguagePluralComputation';

const PluralRuleSymbolExplanation: React.FC<{ symbol: string; exampleNum?: string | number }> = ({
  symbol,
  exampleNum,
}) => {
  return (
    <>
      <SymbolToLabel symbol={symbol} /> (eg.{' '}
      <SymbolToExample symbol={symbol} exampleNum={exampleNum} />)
    </>
  );
};

export default PluralRuleSymbolExplanation;

const SymbolToExample: React.FC<{ symbol: string; exampleNum?: string | number }> = ({
  symbol,
  exampleNum,
}) => {
  const num = exampleNum ?? '123.450';
  if (symbol === '%') {
    return (
      <>
        <code>{num} % 100</code> = <code>{Number(num) % 100}</code>
      </>
    );
  }
  return (
    <>
      <code>{getVariableFromNumberOrString(symbol, num)}</code> in <code>{num}</code>
    </>
  );
};

export const SymbolToLabel: React.FC<{ symbol: string }> = ({ symbol }) => {
  switch (symbol) {
    case '%':
      return 'modulus';
    case 'n':
      return 'absolute value of N';
    case 'i':
      return 'integer digits of N';
    case 'v':
      return 'number of visible fraction digits in N, with trailing zeros';
    case 'w':
      return 'number of visible fraction digits in N, without trailing zeros';
    case 'f':
      return 'visible fraction digits in N, with trailing zeros, expressed as an integer';
    case 't':
      return 'visible fraction digits in N, without trailing zeros, expressed as an integer';
    case 'c':
    case 'e':
      return 'compact decimal exponent value: exponent of the power of 10 used in compact decimal formatting';
    default:
      return <>{symbol}</>;
  }
};
