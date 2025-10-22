import React, { useMemo } from 'react';

import Hoverable from '@shared/ui/Hoverable';
import HoverableButton from '@shared/ui/HoverableButton';

import { LanguageData } from './LanguageTypes';
import {
  convertStringRulesToRuleDeterminer,
  findLanguagePluralRules,
  PluralRuleKey,
} from './lib/languagePluralRules';

const LanguagePluralInfo: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  if (!lang) return null;

  // Find the plural rules for this language
  const pluralRules = useMemo(() => findLanguagePluralRules(lang), [lang]);

  // If we didn't find any, or they are empty, return nothing
  if (!pluralRules || pluralRules.length === 0) {
    return <></>;
  }

  // Create function that determines plural rule for a given number
  const getNumPluralRule = convertStringRulesToRuleDeterminer(pluralRules);

  return (
    <div>
      <div style={{ display: 'flex', gap: '.5em', flexWrap: 'wrap', marginBottom: '0.25em' }}>
        {pluralRules.map(([pluralRuleKey, rule]) => (
          <Hoverable
            key={pluralRuleKey}
            hoverContent={rule}
            style={{
              backgroundColor: getPluralRuleColor(pluralRuleKey),
              borderRadius: '0.25em',
              color: 'var(--color-background)',
              padding: '0.25em',
            }}
          >
            {getPluralRuleKeyLabel(pluralRuleKey)}
          </Hoverable>
        ))}
      </div>
      <PluralRuleExamplesGrid getNumPluralRule={getNumPluralRule} />
    </div>
  );
};

const PluralRuleExamplesGrid: React.FC<{
  getNumPluralRule: (num: number, fixedDecimalDigits: number) => PluralRuleKey | undefined;
}> = ({ getNumPluralRule }) => {
  const zeroTo99 = Array.from({ length: 100 }, (_, i) => getNumPluralRule(i, 0));
  const decimalNums = [0, 0.1, 0.2, 0.3, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
  const smallNumRules = decimalNums.map((num) => getNumPluralRule(num, 1));
  const largeNums = [
    100, 1000, 10000, 100000, 1000000, 10000000, 10000001, 10000002, 10000010, 100000000,
  ];
  const largeNumRules = largeNums.map((num) => getNumPluralRule(num, 0));
  return (
    <table>
      <tbody>
        {Array.from({ length: 10 }, (_, rowNum) => rowNum).map((rowNum) => (
          <tr key={rowNum}>
            <td
              key={decimalNums[rowNum]}
              style={{
                backgroundColor: getPluralRuleColor(smallNumRules[rowNum]!),
              }}
            >
              {decimalNums[rowNum].toFixed(1)}
            </td>
            {Array.from({ length: 10 }, (_, colNum) => colNum).map((colNum) => {
              const cellNum = colNum * 10 + rowNum;
              const ruleKey = zeroTo99[cellNum];
              return (
                <td
                  key={colNum}
                  style={{
                    backgroundColor: getPluralRuleColor(ruleKey!),
                    minWidth: '1em',
                    textAlign: 'right',
                  }}
                >
                  {cellNum}
                </td>
              );
            })}
            <td
              key={largeNums[rowNum]}
              style={{
                backgroundColor: getPluralRuleColor(largeNumRules[rowNum]!),
                textAlign: 'right',
              }}
            >
              {largeNums[rowNum]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function getPluralRuleKeyLabel(key: PluralRuleKey): string {
  switch (key) {
    case PluralRuleKey.Zero:
      return 'Zero';
    case PluralRuleKey.One:
      return 'One';
    case PluralRuleKey.Two:
      return 'Two';
    case PluralRuleKey.Few:
      return 'Few';
    case PluralRuleKey.Many:
      return 'Many';
    case PluralRuleKey.Other:
      return 'Other';
  }
}

function getPluralRuleColor(key: PluralRuleKey): string {
  switch (key) {
    case PluralRuleKey.Zero:
      return 'var(--color-text-blue)';
    case PluralRuleKey.One:
      return 'var(--color-text-green)';
    case PluralRuleKey.Two:
      return 'var(--color-text-yellow)';
    case PluralRuleKey.Few:
      return 'var(--color-text-orange)';
    case PluralRuleKey.Many:
      return 'var(--color-text-red)';
    case PluralRuleKey.Other:
      return 'var(--color-text-secondary)';
  }
}

export default LanguagePluralInfo;
