import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { PluralRuleKey } from './LanguagePluralComputation';
import PluralRuleExplanation from './PluralRuleExplanation';

import './plurals.css';

type Props = {
  ruleKey: PluralRuleKey;
  style?: React.CSSProperties;
  num: string | number;
  conditions: string;
  appearance?: 'td' | 'div';
  showTooltips?: boolean;
};

const LanguagePluralExample: React.FC<Props> = ({
  ruleKey,
  style,
  num,
  conditions,
  appearance = 'div',
  showTooltips = true,
}) => {
  if (appearance === 'td') {
    return (
      <td
        className={'LanguagePluralExample ' + ruleKey}
        style={{ ...style, borderRight: '1em solid var(--color-background)' }}
      >
        {showTooltips ? <WithToolTip ruleKey={ruleKey} conditions={conditions} num={num} /> : num}
      </td>
    );
  }

  return (
    <div
      className={'LanguagePluralExample ' + ruleKey}
      style={{ ...style, display: 'inline-block' }}
    >
      {showTooltips ? <WithToolTip ruleKey={ruleKey} conditions={conditions} num={num} /> : num}
    </div>
  );
};

type WithToolTipProps = {
  ruleKey: PluralRuleKey;
  conditions: string;
  num: string | number;
};

function WithToolTip({ ruleKey, conditions, num }: WithToolTipProps) {
  return (
    <Hoverable
      hoverContent={
        ruleKey !== PluralRuleKey.Other ? (
          <>
            Passes <strong>{ruleKey}</strong>
            <br /> <PluralRuleExplanation rule={conditions} exampleNum={num} />
          </>
        ) : (
          <>
            Does not pass any plural rule conditions, rather is in group{' '}
            <strong>{PluralRuleKey.Other}</strong>
          </>
        )
      }
      style={{ color: ruleKey === PluralRuleKey.Other ? 'inherit' : 'var(--color-background)' }}
    >
      {num}
    </Hoverable>
  );
}

export default LanguagePluralExample;
