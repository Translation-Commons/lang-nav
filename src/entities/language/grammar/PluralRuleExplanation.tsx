import { CopyIcon } from 'lucide-react';
import React, { Fragment, ReactNode } from 'react';

import useCopyToClipboard from '@shared/hooks/useCopyToClipboard';
import Hoverable from '@shared/ui/Hoverable';
import HoverableButton from '@shared/ui/HoverableButton';
import LinkButton from '@shared/ui/LinkButton';

import { getConditionFunction } from './LanguagePluralComputation';
import PluralRuleSymbolExplanation, { SymbolToLabel } from './PluralRuleSymbolExplanation';

const PluralRuleExplanation: React.FC<{ rule: string; exampleNum?: string | number }> = ({
  rule,
  exampleNum,
}) => {
  const { copy } = useCopyToClipboard();

  // 3 main parts "conditions" "@integer examples" "@decimal examples"
  const [conditions, integerExamples, decimalExamples] = rule
    .match(/([^@]*)(?:@integer ([^@]*))?(?:@decimal ([^@]*))?/)!
    .slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
      {conditions.trim() && (
        <div>
          <strong>Equation:</strong>
          <HoverableButton
            onClick={() => copy(conditions)}
            aria-label="Copy conditions"
            style={{ marginLeft: '0.5em', padding: '0.25em' }}
          >
            <CopyIcon size="1em" style={{ display: 'block' }} />
          </HoverableButton>{' '}
          <FormattedConditions conditions={conditions} exampleNum={exampleNum} />
        </div>
      )}
      {integerExamples && exampleNum == null && (
        <div>
          <strong>Integer examples:</strong>{' '}
          {integerExamples.replace(/~/g, '…').replace(/c/g, 'e').trim()}
          <br />
        </div>
      )}
      {decimalExamples && exampleNum == null && (
        <div>
          <strong>Decimal examples:</strong>{' '}
          {decimalExamples.replace(/~/g, '…').replace(/c/g, 'e').trim()}
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

const FormattedConditions: React.FC<{ conditions: string; exampleNum?: string | number }> = ({
  conditions,
  exampleNum,
}) => {
  // eg. "i = 0 and v = 0"
  // eg. "n % 10 = 1 and n % 100 != 11,71,91"
  const orConditions = conditions.split(' or ');
  if (orConditions.length <= 1) {
    return <FormattedAndConditions conditions={conditions} exampleNum={exampleNum} />;
  }
  return (
    <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap', flexDirection: 'column' }}>
      {orConditions.map((conditions, index) => (
        <div key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}>
          <div
            style={{
              border: '1px solid var(--color-text)',
              height: '100%',
              borderRadius: '0.25em',
              borderTop: 0,
              borderBottom: 0,
              padding: '0 0.5em',
            }}
          >
            <FormattedAndConditions conditions={conditions} exampleNum={exampleNum} />
          </div>

          {index < orConditions.length - 1 && (
            <div style={{ color: 'var(--color-text-secondary)' }}>or</div>
          )}
        </div>
      ))}
    </div>
  );
};

const FormattedAndConditions: React.FC<{ conditions: string; exampleNum?: string | number }> = ({
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
      return <Hoverable hoverContent={<SymbolToLabel symbol={symbol} />}>{symbol}</Hoverable>;
    case 'c': // compact decimal exponent value: exponent of the power of 10 used in compact decimal formatting.
    case 'e': // a deprecated synonym for ‘c’. Note: it may be redefined in the future.
      return <Hoverable hoverContent={<SymbolToLabel symbol="e" />}>e</Hoverable>;
    default:
      return (
        <div style={{ display: 'inline-block', color: 'var(--color-text-red)' }}>{symbol}</div>
      );
  }
}

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
