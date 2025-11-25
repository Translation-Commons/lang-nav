import React, { useMemo } from 'react';

import Hoverable from '@features/hovercard/Hoverable';
import { View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageData } from '../LanguageTypes';

import {
  convertStringRulesToRuleDeterminer,
  findLanguagePluralRules,
  PluralRuleKey,
} from './LanguagePluralComputation';
import PluralRuleExplanation from './PluralRuleExplanation';
import PluralRuleSymbolExplanation from './PluralRuleSymbolExplanation';
import { getPluralRuleColor } from './PluralStrings';

const SMALL_NUMS = ['0.0', 0.1, 0.2, 0.3, 0.5, 0.7, '1.0', 1.5, '2.0', 2.5];
const LARGE_NUMS = [
  100, 1000, 10000, 100000, 1000000, 1000001, 1000002, 1000010, 10000000, 100000000,
];
const EXPO_NUMS = [
  '1e2',
  '1e3',
  '1e4',
  '1e5',
  '1e6',
  '1.000001e6',
  '1.000002e6',
  '1.00001e6',
  '1e7',
  '1e8',
];

const LanguagePluralGrid: React.FC<{ lang: LanguageData }> = ({ lang }) => {
  // Find the plural rules for this language
  // If we didn't find any, or they are empty, return nothing
  const pluralRules = useMemo(() => findLanguagePluralRules(lang), [lang]);
  if (!pluralRules || pluralRules.length === 0) {
    return <></>;
  }

  // Create function that determines plural rule for a given number
  const getNumPluralRule = convertStringRulesToRuleDeterminer(pluralRules);
  const conditionsForRule = (ruleKey: PluralRuleKey) =>
    pluralRules.find(([key]) => key === ruleKey)?.[1] || '';

  // Get examples
  const zeroTo99 = Array.from({ length: 100 }, (_, i) => getNumPluralRule(i));
  const smallNumRules = SMALL_NUMS.map((num) => getNumPluralRule(num));
  const largeNumRules = LARGE_NUMS.map((num) => getNumPluralRule(num));
  const expoNumRules = EXPO_NUMS.map((num) => getNumPluralRule(num));
  return (
    <table>
      <tbody>
        {Array.from({ length: 10 }, (_, rowNum) => rowNum).map((rowNum) => (
          <tr key={rowNum}>
            <ExampleCell
              key={SMALL_NUMS[rowNum]}
              ruleKey={smallNumRules[rowNum]!}
              conditions={conditionsForRule(smallNumRules[rowNum]!)}
              style={{ borderRight: '1em solid var(--color-background)' }}
              num={SMALL_NUMS[rowNum]}
            />
            {Array.from({ length: 10 }, (_, colNum) => colNum).map((colNum) => {
              const cellNum = colNum * 10 + rowNum;
              return (
                <ExampleCell
                  key={cellNum}
                  ruleKey={zeroTo99[cellNum]!}
                  num={cellNum}
                  conditions={conditionsForRule(zeroTo99[cellNum]!)}
                />
              );
            })}
            <ExampleCell
              key={LARGE_NUMS[rowNum]}
              ruleKey={largeNumRules[rowNum]!}
              style={{ borderLeft: '1em solid var(--color-background)' }}
              num={LARGE_NUMS[rowNum]}
              conditions={conditionsForRule(largeNumRules[rowNum]!)}
            />
            <ExampleCell
              key={EXPO_NUMS[rowNum]}
              ruleKey={expoNumRules[rowNum]!}
              num={EXPO_NUMS[rowNum]}
              conditions={conditionsForRule(expoNumRules[rowNum]!)}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ExampleCell: React.FC<{
  ruleKey: PluralRuleKey;
  style?: React.CSSProperties;
  num: string | number;
  conditions: string;
}> = ({ ruleKey, style, num, conditions }) => {
  const { view } = usePageParams();

  return (
    <td
      style={{
        ...style,
        color: ruleKey === PluralRuleKey.Other ? 'inherit' : 'var(--color-background)',
        backgroundColor: getPluralRuleColor(ruleKey),
        minWidth: '1em',
        textAlign: 'right',
        padding: '0 0.25em',
      }}
    >
      {view !== View.Table ? ( // Too many hoverables in the table view, will tank page performance
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
                {['n', 'i', 'v', 'w', 'f', 't', 'c', 'e'].map((symbol) => (
                  <div key={symbol} style={{ marginTop: '0.25em' }}>
                    <strong>{symbol}:</strong>{' '}
                    <PluralRuleSymbolExplanation symbol={symbol} exampleNum={num} />
                  </div>
                ))}
              </>
            )
          }
          style={{ color: ruleKey === PluralRuleKey.Other ? 'inherit' : 'var(--color-background)' }}
        >
          {num}
        </Hoverable>
      ) : (
        num
      )}
    </td>
  );
};

export default LanguagePluralGrid;
