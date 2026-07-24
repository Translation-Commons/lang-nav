import React from 'react';

import LanguagePluralsTable from '@widgets/tables/LanguagePluralsTable';

import LanguagePluralCategory from '@entities/language/plurals/LanguagePluralCategory';
import { PluralRuleKey } from '@entities/language/plurals/LanguagePluralComputation';
import PluralRulesLanguageExamplesTable from '@entities/language/plurals/PluralRulesLanguageExamplesTable';
import PluralRulesSummaryTable from '@entities/language/plurals/PluralRulesSummaryTable';

import ExternalLink from '@shared/ui/ExternalLink';

const ReportLanguagePlurals: React.FC = () => {
  return (
    <>
      <div>
        When counting objects, languages may change the form of the noun based on how many objects
        are being counted. In English we think of this as singular (1 cat,{' '}
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.One} />) and plural (2 cats,{' '}
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Other} />
        ). Some languages have more than 2 forms. For example, Croatian has a special form for 2-4
        objects (
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Few} />
        ). Additionally, the boundaries of singular and plural may be different in other languages.
        For example, in French &quot;0 cats&quot; is translated to &quot;0 chat&quot; (
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.One} /> form).
      </div>
      <div>
        Outside of the particular noun, there may also be changes to words around the noun, such as
        a third case in French when using counting groups (&quot;dozens&quot;,
        &quot;thousands&quot;,...) -- notice the &quot;<strong>de</strong>&quot; added in &quot;un
        million <strong>de</strong> chats&quot; as opposed to &quot;1,000,000 chats&quot;. While
        there are only 2 noun cases, the CLDR system takes this as a 3rd counting case since it
        affects plural constructions: the pattern &quot;# chats&quot; needs to become &quot;# de
        chats&quot;. See the summary tables below for examples on different plural constructions and
        the full table below for all languages.
      </div>
      <div style={{ display: 'flex', gap: '2em', justifyContent: 'space-evenly', width: '100%' }}>
        <PluralRulesSummaryTable />
        <PluralRulesLanguageExamplesTable />
      </div>
      <div>
        See the following table for information for all languages. Columns with just a number as the
        title show the case something with that number would belong to. For example, if &quot;0
        cats&quot; is handled with its own case (
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Zero} />
        ), as the singular case(
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.One} />) or with the other plural case(
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Other} />
        ). Use the table&apos;s column selector to see other number examples to compare. This data
        comes from CLDR and an empty row (without even an{' '}
        <LanguagePluralCategory pluralRuleKey={PluralRuleKey.Other} /> case) is not covered by CLDR.
        Please consult the{' '}
        <ExternalLink href="https://unicode.org/reports/tr35/tr35-numbers.html?#Language_Plural_Rules">
          Unicode Specification
        </ExternalLink>{' '}
        and{' '}
        <ExternalLink href="https://unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html">
          CLDR charts
        </ExternalLink>{' '}
        for more information.
      </div>
      <LanguagePluralsTable />
    </>
  );
};

export default ReportLanguagePlurals;
