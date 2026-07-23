import React, { useMemo } from 'react';

import { LanguageData } from '../LanguageTypes';

import {
  convertStringRulesToRuleDeterminer,
  findLanguagePluralRules,
  PluralRuleKey,
} from './LanguagePluralComputation';
import LanguagePluralExample from './LanguagePluralExample';
import {
  COMPACT_NUM_LABELS,
  COMPACT_NUMS,
  LARGE_NUMS,
  SMALL_NUMS,
  ZERO_TO_99_NUMS,
} from './PluralNumberSets';

type Props = {
  lang: LanguageData;
  showTooltips?: boolean;
};

const LanguagePluralGrid: React.FC<Props> = ({ lang, showTooltips = true }) => {
  // Find the plural rules for this language
  // If we didn't find any, or they are empty, return nothing
  const pluralRules = useMemo(() => findLanguagePluralRules(lang), [lang]);
  if (!pluralRules || pluralRules.length === 0) return <></>;

  // Create function that determines plural rule for a given number
  const getNumPluralRule = convertStringRulesToRuleDeterminer(pluralRules);
  const conditionsForRule = (ruleKey: PluralRuleKey) =>
    pluralRules.find(([key]) => key === ruleKey)?.[1] || '';

  // Get examples
  const zeroTo99 = ZERO_TO_99_NUMS.map((num) => getNumPluralRule(num));
  const smallNumRules = SMALL_NUMS.map((num) => getNumPluralRule(num));
  const largeNumRules = LARGE_NUMS.map((num) => getNumPluralRule(num));
  const compactNumRules = COMPACT_NUMS.map((num) => getNumPluralRule(num));
  return (
    <table>
      <tbody>
        {Array.from({ length: 10 }, (_, rowNum) => rowNum).map((rowNum) => (
          <tr key={rowNum}>
            <LanguagePluralExample
              key={SMALL_NUMS[rowNum]}
              appearance="td"
              ruleKey={smallNumRules[rowNum]!}
              conditions={conditionsForRule(smallNumRules[rowNum]!)}
              style={{ borderRight: '1em solid var(--color-background)' }}
              num={SMALL_NUMS[rowNum]}
              showTooltips={showTooltips}
            />
            {Array.from({ length: 10 }, (_, colNum) => colNum).map((colNum) => {
              const cellNum = colNum * 10 + rowNum;
              return (
                <LanguagePluralExample
                  key={cellNum}
                  appearance="td"
                  ruleKey={zeroTo99[cellNum]!}
                  num={cellNum}
                  conditions={conditionsForRule(zeroTo99[cellNum]!)}
                  showTooltips={showTooltips}
                />
              );
            })}
            <LanguagePluralExample
              key={LARGE_NUMS[rowNum]}
              appearance="td"
              ruleKey={largeNumRules[rowNum]!}
              style={{ borderLeft: '1em solid var(--color-background)' }}
              num={LARGE_NUMS[rowNum]}
              conditions={conditionsForRule(largeNumRules[rowNum]!)}
              showTooltips={showTooltips}
            />
            <LanguagePluralExample
              key={COMPACT_NUMS[rowNum]}
              appearance="td"
              ruleKey={compactNumRules[rowNum]!}
              num={COMPACT_NUM_LABELS[rowNum]}
              conditions={conditionsForRule(compactNumRules[rowNum]!)}
              showTooltips={showTooltips}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LanguagePluralGrid;
