import { CopyIcon } from 'lucide-react';
import React, { Fragment, ReactNode } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableButton from '@features/layers/hovercard/HoverableButton';

import useCopyToClipboard from '@shared/hooks/useCopyToClipboard';
import { cn } from '@shared/lib/utils';
import LinkButton from '@shared/ui/old/LinkButton';

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
    <div className="flex flex-col gap-4">
      {conditions.trim() && (
        <div>
          <strong>Equation:</strong>
          <HoverableButton
            onClick={() => copy(conditions)}
            aria-label="Copy conditions"
            className="ml-2 p-1"
          >
            <CopyIcon size="1em" className="block" />
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
    <div className="flex gap-2 flex-wrap flex-col">
      {orConditions.map((conditions, index) => (
        <div key={index} className="inline-flex items-center gap-1">
          <div className="border border-foreground h-full rounded-[0.25em] border-t-0 border-b-0 py-0 px-2">
            <FormattedAndConditions conditions={conditions} exampleNum={exampleNum} />
          </div>

          {index < orConditions.length - 1 && <div className="text-muted-foreground">or</div>}
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
    <div className="inline-flex flex-wrap items-center gap-1">
      {andConditions.map((cond, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="text-muted-foreground py-0 px-1">and</span>}
          <div className="[text-wrap:nowrap]">
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
        <span
          key={i}
          className={cn('py-0 px-1', passes && 'rounded-xs bg-yellow-200 dark:bg-yellow-900')}
        >
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
      return <div className="inline-block text-red">{symbol}</div>;
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
      <ul className="mt-1 mr-0 mb-0 ml-4 p-0">
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
