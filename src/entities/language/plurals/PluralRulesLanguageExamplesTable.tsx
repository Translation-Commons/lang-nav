import React from 'react';

import Hoverable from '@features/layers/hovercard/Hoverable';

import { PluralRuleKey } from './LanguagePluralComputation';

function PluralRulesLanguageExamplesTable() {
  return (
    <table style={{ width: 'fit-content' }}>
      <thead>
        <tr>
          <th>English</th>
          <th>French</th>
          <th>Croatian</th>
          <th colSpan={2}>
            <Hoverable
              hoverContent={
                <>
                  Modern Standard Arabic. Generally, there are only 3 plural forms (1/2/3+). The
                  11-100 range and superplural ranges are not used by all speakers. Additionally,
                  the zero case is usually not separated out, but you can think of the equivalent in
                  English since instead of &quot;0 cats&quot;, it would be more comfortable to write
                  &quot;no cats&quot;. Translations in Arabic and Latin writing are provided and
                  most values have explanations on hover.
                </>
              }
            >
              Arabic
            </Hoverable>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <Cell>0 cats</Cell>
          <Cell ruleKey={PluralRuleKey.One}>0 chats</Cell>
          <Cell>0 mačaka</Cell>
          <Cell ruleKey={PluralRuleKey.Zero} rtl={true}>
            لا قطة
          </Cell>
          <Cell
            ruleKey={PluralRuleKey.Zero}
            explanation={
              <>
                Literally &quot;no cat&quot;. A literal translation is &quot;ṣifru qiṭaṭin&quot;
                (صِفْرُ قِطَطٍ) but that is an awkward form.
              </>
            }
          >
            lā qiṭṭa
          </Cell>
        </tr>
        <tr>
          <Cell ruleKey={PluralRuleKey.One}>1 cat</Cell>
          <Cell ruleKey={PluralRuleKey.One}>1 chat</Cell>
          <Cell ruleKey={PluralRuleKey.One}>1 mačak</Cell>
          <Cell ruleKey={PluralRuleKey.One} rtl={true}>
            قِطٌّ وَاحِدٌ
          </Cell>
          <Cell
            ruleKey={PluralRuleKey.One}
            explanation={<>Some people pronounce this &quot;qitt&quot;.</>}
          >
            qiṭṭun 1
          </Cell>
        </tr>
        <tr>
          <Cell>2 cats</Cell>
          <Cell>2 chats</Cell>
          <Cell ruleKey={PluralRuleKey.Few}>2 mačka</Cell>
          <Cell ruleKey={PluralRuleKey.Two} rtl={true}>
            قِطَّانِ
          </Cell>
          <Cell ruleKey={PluralRuleKey.Two}>qiṭṭāni</Cell>
        </tr>
        <tr>
          <Cell>3 cats</Cell>
          <Cell>3 chats</Cell>
          <Cell ruleKey={PluralRuleKey.Few}>3 mačka</Cell>
          <Cell ruleKey={PluralRuleKey.Few} rtl={true}>
            ثَلَاثَةُ قِطَطٍ
          </Cell>
          <Cell
            ruleKey={PluralRuleKey.Few}
            explanation={
              <>
                While in CLDR this is specifically for 3-10, in practice this used for most 3+
                cases. Some people pronounce this &quot;qitat&quot;.
              </>
            }
          >
            3 qiṭaṭin
          </Cell>
        </tr>
        <tr>
          <Cell>20 cats</Cell>
          <Cell>20 chats</Cell>
          <Cell>20 mačaka</Cell>
          <Cell ruleKey={PluralRuleKey.Many} rtl={true}>
            عِشْرُونَ قِطًّا
          </Cell>
          <Cell
            ruleKey={PluralRuleKey.Many}
            explanation={
              <>
                According to grammar rules, the noun is changed from nominative to accusative when
                there are many of them (11-100). Some people just use the 3+ form (qiṭaṭin/qitat).
              </>
            }
          >
            20 qiṭṭan
          </Cell>
        </tr>
        <tr>
          <Cell>1 million cats</Cell>
          <Cell ruleKey={PluralRuleKey.Many}>un million de chats</Cell>
          <Cell>1 milijun mačaka</Cell>
          <Cell rtl={true}>مَلْيُونُ قِطٍّ</Cell>
          <Cell
            explanation={
              <>
                According to grammar rules, the noun is changed from nominative to genitive when
                there are very many of them. Some people just use the 3+ form (qiṭaṭin/qitat).
              </>
            }
          >
            malyūnu qiṭṭin
          </Cell>
        </tr>
      </tbody>
    </table>
  );
}

type CellProps = {
  children: React.ReactNode;
  explanation?: React.ReactNode;
  rtl?: boolean;
  ruleKey?: PluralRuleKey;
};

const Cell: React.FC<CellProps> = ({ children, ruleKey, rtl, explanation }) => {
  let contents = children;
  if (explanation) {
    contents = (
      <Hoverable
        hoverContent={explanation}
        style={{
          color:
            ruleKey && ruleKey !== PluralRuleKey.Other ? 'var(--color-text-on-color)' : undefined,
        }}
      >
        {children}
      </Hoverable>
    );
  }

  return (
    <td
      className={ruleKey}
      style={{ direction: rtl ? 'rtl' : 'ltr', borderRadius: '0.25em', padding: '0 0.25em' }}
    >
      {contents}
    </td>
  );
};

export default PluralRulesLanguageExamplesTable;
