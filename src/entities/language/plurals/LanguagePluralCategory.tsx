import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { PluralRuleKey } from './LanguagePluralComputation';
import PluralRuleExplanation from './PluralRuleExplanation';
import { getPluralRuleKeyLabel } from './PluralStrings';

import './plurals.css';

type Props = {
  pluralRuleKey: PluralRuleKey;
  rule?: string;
};

const LanguagePluralCategory: React.FC<Props> = ({ pluralRuleKey, rule }) => {
  if (!rule) {
    return (
      <span className={'LanguagePluralCategory ' + pluralRuleKey}>
        {getPluralRuleKeyLabel(pluralRuleKey)}
      </span>
    );
  }

  return (
    <Hoverable
      className={'LanguagePluralCategory ' + pluralRuleKey}
      hoverContent={<PluralRuleExplanation rule={rule} />}
    >
      {getPluralRuleKeyLabel(pluralRuleKey)}
    </Hoverable>
  );
};

export default LanguagePluralCategory;
