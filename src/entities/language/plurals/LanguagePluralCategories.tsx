import React, { useMemo } from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import Deemphasized from '@shared/ui/Deemphasized';

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
    <div style={{ display: 'flex', gap: '0.25em', flexWrap: 'wrap', marginBottom: '0.25em' }}>
      {pluralRules.map(([pluralRuleKey, rule]) => (
        <Hoverable
          key={pluralRuleKey}
          hoverContent={
            <>
              <PluralRuleExplanation rule={rule} />
            </>
          }
          style={{
            backgroundColor: getPluralRuleColor(pluralRuleKey),
            borderRadius: '0.25em',
            color: pluralRuleKey === PluralRuleKey.Other ? 'inherit' : 'var(--color-background)',
            padding: '0.25em',
            margin: '0',
          }}
        >
          {getPluralRuleKeyLabel(pluralRuleKey)}
        </Hoverable>
      ))}
    </div>
  );
};

export default LanguagePluralCategories;
