import React from 'react';

import LinkButton from '@shared/ui/LinkButton';

import PluralRuleEquation from './PluralRuleEquation';
import PluralRuleExampleSet from './PluralRuleExampleSet';
import { parsePluralRuleEquation } from './pluralRuleParsing';
import PluralRuleSymbolExplanation from './PluralRuleSymbolExplanation';

const PluralRuleExplanation: React.FC<{ rule: string; exampleNum?: string | number }> = ({
  rule,
  exampleNum,
}) => {
  const { conditions, integerExamples, decimalExamples } = parsePluralRuleEquation(rule);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      {conditions && (
        <div>
          <strong>Equation:</strong>
          <PluralRuleEquation rule={rule} includeCopyButton={true} />
        </div>
      )}
      {integerExamples && exampleNum == null && (
        <div>
          <strong>Integer examples:</strong>{' '}
          <PluralRuleExampleSet rule={rule} exampleSet="integer" />
          <br />
        </div>
      )}
      {decimalExamples && exampleNum == null && (
        <div>
          <strong>Decimal examples:</strong>{' '}
          <PluralRuleExampleSet rule={rule} exampleSet="decimal" />
        </div>
      )}
      <SymbolsExplanation conditions={conditions} exampleNum={exampleNum} />
      {exampleNum == null && (
        <div>
          <LinkButton href="https://unicode.org/reports/tr35/tr35-numbers.html?#Language_Plural_Rules">
            Unicode Specification
          </LinkButton>
          <LinkButton href="https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html">
            CLDR Charts
          </LinkButton>
        </div>
      )}
    </div>
  );
};

const SymbolsExplanation: React.FC<{ conditions: string; exampleNum?: string | number }> = ({
  conditions,
  exampleNum,
}) => {
  const conditionsWithoutKeywords = conditions.replace(/(and|or)/g, '');
  const symbolsPresent = ['n', 'i', 'v', 'w', 'f', 't', 'c', 'e', '%'].filter((symbol) =>
    conditionsWithoutKeywords.includes(symbol),
  );
  if (symbolsPresent.length === 0) {
    return <></>;
  }

  return (
    <div>
      <strong>Equation Symbols: </strong>
      <ul style={{ margin: '0.25em 0 0 1em', padding: 0 }}>
        {symbolsPresent.map((symbol) => (
          <li key={symbol}>
            <code>{symbol}</code>:{' '}
            <PluralRuleSymbolExplanation symbol={symbol} exampleNum={exampleNum} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PluralRuleExplanation;
