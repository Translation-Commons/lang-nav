import { TriangleAlertIcon } from 'lucide-react';

import Hoverable from '@features/layers/hovercard/Hoverable';
import { CodeColumn, NameColumn } from '@features/table/CommonColumns';
import TableColumn from '@features/table/TableColumn';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';
import LanguagePluralCategories from '@entities/language/plurals/LanguagePluralCategories';
import LanguagePluralCategory from '@entities/language/plurals/LanguagePluralCategory';
import {
  convertStringRulesToRuleDeterminer,
  findLanguagePluralRules,
  PluralRuleKey,
} from '@entities/language/plurals/LanguagePluralComputation';
import LanguagePluralExample from '@entities/language/plurals/LanguagePluralExample';
import LanguagePluralGrid from '@entities/language/plurals/LanguagePluralGrid';
import LanguagePluralGridButton from '@entities/language/plurals/LanguagePluralGridToggle';
import {
  COMPACT_NUM_LABELS,
  COMPACT_NUMS,
  LARGE_NUMS,
  PROTOTYPICAL_NUMS,
  SMALL_NUMS,
} from '@entities/language/plurals/PluralNumberSets';
import PluralRuleEquation from '@entities/language/plurals/PluralRuleEquation';
import PluralRuleExampleSet from '@entities/language/plurals/PluralRuleExampleSet';
import { getPluralRuleKeyLabel } from '@entities/language/plurals/PluralStrings';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

function getLanguagePluralsColumns(): TableColumn<LanguageData>[] {
  function getRuleColumn(
    ruleKey: PluralRuleKey,
    type: 'existence' | 'equation' | 'integer examples' | 'decimal examples',
  ): TableColumn<LanguageData> {
    const label =
      type === 'existence'
        ? 'Has ' + getPluralRuleKeyLabel(ruleKey) + ' case'
        : getPluralRuleKeyLabel(ruleKey) + ' ' + type;
    return {
      key: label,
      label: type === 'existence' ? <div style={{ width: 'min-content' }}>{label}</div> : label,
      labelInColumnGroup: label,
      render: (lang) => {
        const pluralRules = findLanguagePluralRules(lang);
        if (!pluralRules || pluralRules.length === 0) return null;
        const ruleConditions = pluralRules.find(([key]) => key === ruleKey)?.[1];
        if (!ruleConditions) return null;
        if (type === 'equation') return <PluralRuleEquation rule={ruleConditions} />;
        if (type === 'integer examples')
          return <PluralRuleExampleSet rule={ruleConditions} exampleSet="integer" />;
        if (type === 'decimal examples')
          return <PluralRuleExampleSet rule={ruleConditions} exampleSet="decimal" />;
        return <LanguagePluralCategory pluralRuleKey={ruleKey} rule={ruleConditions} />;
      },
      isInitiallyVisible: type === 'existence',
      columnGroup: 'Plural rules ' + type,
    };
  }

  function getExampleColumn(
    num: number | string,
    group: string,
    label?: string,
  ): TableColumn<LanguageData> {
    return {
      key: group + num.toString(), // needs to be unique
      label: label || num.toString(),
      render: (lang) => {
        const pluralRules = findLanguagePluralRules(lang);
        if (!pluralRules || pluralRules.length === 0) return null;
        const rule = convertStringRulesToRuleDeterminer(pluralRules)(num);
        if (rule == null) return null;
        const ruleConditions = pluralRules.find(([key]) => key === rule)?.[1] || '';
        return (
          <LanguagePluralExample
            key={num}
            ruleKey={rule}
            conditions={ruleConditions}
            num={label ?? num}
          />
        );
      },
      isInitiallyVisible: PROTOTYPICAL_NUMS.includes(num),
      columnGroup: group,
    };
  }

  const smallNumCols = SMALL_NUMS.map((num) => getExampleColumn(num, 'Decimals'));
  const zeroToNineNumCols = Array.from({ length: 10 }, (_, i) => getExampleColumn(i, '0 to 9'));
  const teensNumCols = Array.from({ length: 10 }, (_, i) => getExampleColumn(i + 10, 'Teens'));
  const tensNumCols = Array.from({ length: 8 }, (_, i) => getExampleColumn((i + 2) * 10, 'Tens'));
  const largeNumCols = LARGE_NUMS.map((num) => getExampleColumn(num, 'Large Numbers'));
  const compactNumCols = COMPACT_NUMS.map((num, i) =>
    getExampleColumn(num, 'Compact Numbers', COMPACT_NUM_LABELS[i]),
  );

  return [
    { ...CodeColumn, columnGroup: 'ID' },
    {
      ...NameColumn,
      render: (lang) => {
        const rules = findLanguagePluralRules(lang);
        return (
          <Hoverable
            hoverContent={rules == null ? 'No plural rules available from CLDR' : undefined}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}
          >
            {lang.nameDisplay}{' '}
            {rules == null && (
              <TriangleAlertIcon
                display="block"
                size="1em"
                style={{ color: 'var(--color-yellow)' }}
              />
            )}
          </Hoverable>
        );
      },
      columnGroup: 'ID',
    },
    {
      key: 'Scope',
      render: (lang) => getLanguageScopeLabel(lang.scope),
      isInitiallyVisible: false,
      field: Field.LanguageScope,
      columnGroup: 'ID',
    },
    {
      key: 'Applicable plural rules',
      render: (lang) => <LanguagePluralCategories lang={lang} />,
      isInitiallyVisible: false,
      columnGroup: 'Plural rules',
    },
    ...Object.values(PluralRuleKey).map((ruleKey) => getRuleColumn(ruleKey, 'existence')),
    ...Object.values(PluralRuleKey).map((ruleKey) => getRuleColumn(ruleKey, 'equation')),
    ...Object.values(PluralRuleKey).map((ruleKey) => getRuleColumn(ruleKey, 'integer examples')),
    ...Object.values(PluralRuleKey).map((ruleKey) => getRuleColumn(ruleKey, 'decimal examples')),
    ...smallNumCols,
    ...zeroToNineNumCols,
    ...teensNumCols,
    ...tensNumCols,
    ...largeNumCols,
    ...compactNumCols,
    {
      key: 'Full example grid (hover)',
      render: (lang) => <LanguagePluralGridButton lang={lang} showTooltips={false} />,
      isInitiallyVisible: true,
      columnGroup: 'Example grid',
    },
    {
      key: 'Full example grid',
      render: (lang) => (
        <LanguagePluralGrid
          lang={lang}
          showTooltips={false /* too many items to render for table view */}
        />
      ),
      isInitiallyVisible: false,
      columnGroup: 'Example grid',
    },
  ];
}

export default getLanguagePluralsColumns;
