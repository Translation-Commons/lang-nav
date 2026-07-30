import React, { useMemo } from 'react';

import Deemphasized from '@shared/ui/Deemphasized';

import { LanguageData } from '../LanguageTypes';

import LanguagePluralCategory from './LanguagePluralCategory';
import { findLanguagePluralRules } from './LanguagePluralComputation';

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
        <LanguagePluralCategory key={pluralRuleKey} pluralRuleKey={pluralRuleKey} rule={rule} />
      ))}
    </div>
  );
};

export default LanguagePluralCategories;
