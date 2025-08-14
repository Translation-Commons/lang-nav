import plurals from 'cldr-core/supplemental/plurals.json';
import React, { useMemo } from 'react';

import { LanguageData } from './LanguageTypes';

enum PluralRuleKey {
  Zero = 'pluralRule-count-zero',
  One = 'pluralRule-count-one',
  Two = 'pluralRule-count-two',
  Few = 'pluralRule-count-few',
  Many = 'pluralRule-count-many',
  Other = 'pluralRule-count-other',
}

type PluralRuleType = Partial<Record<PluralRuleKey, string>>;

const LanguagePluralInfo: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang) return null;

  const allPluralRules = plurals.supplemental['plurals-type-cardinal'];

  const lookupID = lang.codeISO6391 ?? lang.ID;
  const pluralRules: PluralRuleType = useMemo(() => {
    const pluralRules =
      (Object.entries(allPluralRules).find(([language]) => language === lookupID)?.[1] as
        | Record<string, string>
        | undefined) ?? {};
    console.log('pluralRules', pluralRules);

    return Object.values(PluralRuleKey).reduce((acc, key) => {
      if (key in pluralRules) acc[key] = pluralRules[key] ?? null;
      return acc;
    }, {} as PluralRuleType);
  }, [allPluralRules, lookupID]);

  return (
    <div className="LanguagePluralInfo">
      <h3>Plural Rules</h3>
      {Object.entries(pluralRules).map(([count, rule]) => (
        <div key={count}>
          {count}: {rule}
        </div>
      ))}
    </div>
  );
};

export default LanguagePluralInfo;
