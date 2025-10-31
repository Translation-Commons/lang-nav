import React, { useMemo } from 'react';

import { LanguageData } from '../LanguageTypes';

import { findLanguagePluralRules } from './LanguagePluralComputation';

const LanguagePluralRuleSymbolsUsed: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  // Find the plural rules for this language
  // If we didn't find any, or they are empty, return nothing
  const pluralRules = useMemo(() => findLanguagePluralRules(lang), [lang]);
  if (!pluralRules || pluralRules.length === 0) {
    return <></>;
  }

  return <></>;
};
export default LanguagePluralRuleSymbolsUsed;
