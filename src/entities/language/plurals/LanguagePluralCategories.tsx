import React, { useMemo } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { cn } from '@shared/lib/utils';
import Deemphasized from '@shared/ui/old/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import { findLanguagePluralRules, PluralRuleKey } from './LanguagePluralComputation';
import PluralRuleExplanation from './PluralRuleExplanation';
import { getPluralRuleColor, getPluralRuleKeyLabel } from './PluralStrings';

const LanguagePluralCategories: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  // Find the plural rules for this language
  // If we didn't find any, or they are empty, return nothing
  const pluralRules = useMemo(() => findLanguagePluralRules(lang), [lang]);
  if (!pluralRules || pluralRules.length === 0) {
    return <Deemphasized>not available</Deemphasized>;
  }

  return (
    <div className="flex gap-1 flex-wrap mb-1">
      {pluralRules.map(([pluralRuleKey, rule]) => (
        <Hoverable
          key={pluralRuleKey}
          hoverContent={
            <>
              <PluralRuleExplanation rule={rule} />
            </>
          }
          className={cn(
            'm-0 rounded-sm p-1',
            pluralRuleKey !== PluralRuleKey.Other && 'text-primary-foreground',
          )}
          style={{ backgroundColor: getPluralRuleColor(pluralRuleKey) }}
        >
          {getPluralRuleKeyLabel(pluralRuleKey)}
        </Hoverable>
      ))}
    </div>
  );
};

export default LanguagePluralCategories;
