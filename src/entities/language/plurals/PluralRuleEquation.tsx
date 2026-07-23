import { CopyIcon } from 'lucide-react';
import React, { Fragment, ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';

import useCopyToClipboard from '@shared/hooks/useCopyToClipboard';

import { getConditionFunction } from './LanguagePluralComputation';
import { parsePluralRuleEquation } from './pluralRuleParsing';
import { SymbolToLabel } from './PluralRuleSymbolExplanation';

type Props = {
  rule: string;
  exampleNum?: string | number;
  includeCopyButton?: boolean;
};

const PluralRuleEquation: React.FC<Props> = ({ rule, exampleNum, includeCopyButton = false }) => {
  const { copy } = useCopyToClipboard();

  const { conditions } = parsePluralRuleEquation(rule);

  return (
    <>
      {includeCopyButton && (
        <>
          <HoverableButton
            onClick={() => copy(conditions)}
            aria-label="Copy conditions"
            style={{ marginLeft: '0.5em', padding: '0.25em' }}
          >
            <CopyIcon size="1em" style={{ display: 'block' }} />
          </HoverableButton>{' '}
        </>
      )}
      <FormattedConditions conditions={conditions} exampleNum={exampleNum} />
    </>
  );
};

const FormattedConditions: React.FC<{ conditions: string; exampleNum?: string | number }> = ({
  conditions,
  exampleNum,
}) => {
  // eg. "i = 0 and v = 0"
  const andConditions = conditions.split(' and ');
  if (andConditions.length <= 1) {
    return <FormattedCondition condition={conditions} exampleNum={exampleNum} />;
  }
  return (
    <div style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.25em' }}>
      {andConditions.map((cond, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span style={{ color: 'var(--color-text-secondary)', padding: '0 0.25em' }}>and</span>
          )}
          <div style={{ textWrap: 'nowrap' }}>
            (<FormattedCondition key={index} condition={cond} exampleNum={exampleNum} />)
          </div>
        </Fragment>
      ))}
    </div>
  );
};

const FormattedCondition: React.FC<{ condition: string; exampleNum?: string | number }> = ({
  condition,
  exampleNum,
}) => {
  const symbols = condition.split(' ');
  const passes = exampleNum != null ? getConditionFunction(condition)(exampleNum) : undefined;
  return (
    <>
      {symbols.map((symbol, i) => (
        <span style={{ padding: '0 0.25em' }} key={i} className={passes ? 'highlighted' : ''}>
          <SymbolToFormat symbol={symbol} />
        </span>
      ))}
    </>
  );
};

function SymbolToFormat({ symbol }: { symbol: string }): ReactNode {
  // If it's a number or range, return as is
  if (symbol.match('^[0-9]')) {
    if (symbol.includes('..')) {
      return <>{symbol.replace('..', '…')}</>;
    }
    return symbol;
  }

  // Otherwise try to parse the symbol
  switch (symbol) {
    case '=':
      return '=';
    case '!=':
      return '≠';
    case '%':
      return '%';
    case 'n': // the absolute value of N
    case 'i': // the integer digits of N
    case 'v': // the number of visible fraction digits in N, with trailing zeros
    case 'w': // the number of visible fraction digits in N, without trailing zeros
    case 'f': // the visible fraction digits in N, with trailing zeros, expressed as an integer
    case 't': // the visible fraction digits in N, without trailing zeros, expressed as an integer
    case 'c': // compact decimal exponent value: exponent of the power of 10 used in compact decimal formatting.
    case 'e': // scientific notation exponent value
      return <Hoverable hoverContent={<SymbolToLabel symbol={symbol} />}>{symbol}</Hoverable>;
    default:
      return <div style={{ display: 'inline-block', color: 'var(--color-red)' }}>{symbol}</div>;
  }
}

export default PluralRuleEquation;
