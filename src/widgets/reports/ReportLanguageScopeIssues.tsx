import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { filterLanguagesWithScopeIssues, getLanguagePath } from './getLanguageScopeIssues';

const ReportLanguageScopeIssues: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  const languagesWithIssues = useMemo(
    () => filterLanguagesWithScopeIssues(languagesInSelectedSource),
    [languagesInSelectedSource],
  );

  return (
    <>
      This report flags languages in the current language source whose scope is broader than their
      direct parent&apos;s scope, which may indicate a hierarchy inconsistency. Results are shown
      regardless of the sidebar Language Scope filter so dialect and family issues remain visible.
      <InteractiveEntityTable<LanguageData>
        tableID={TableID.LanguageScopeIssues}
        shouldFilterUsingSearchBar={false}
        useScope={false}
        columns={[
          {
            key: 'Parent Code',
            render: (lang) => lang.parentLanguage?.codeDisplay,
          },
          {
            key: 'Parent Name',
            render: (lang) =>
              lang.parentLanguage != null ? (
                <HoverableObjectName object={lang.parentLanguage} />
              ) : null,
            exportValue: (lang) => lang.parentLanguage?.nameDisplay,
          },
          {
            key: 'Parent Scope',
            render: (lang) =>
              lang.parentLanguage?.scope != null
                ? getLanguageScopeLabel(lang.parentLanguage.scope)
                : null,
          },
          {
            key: 'Child Code',
            render: (lang) => lang.codeDisplay,
            field: Field.Code,
          },
          {
            key: 'Child Name',
            render: (lang) => <HoverableObjectName object={lang} />,
            exportValue: (lang) => lang.nameDisplay,
            field: Field.Name,
          },
          {
            key: 'Child Scope',
            render: (lang) => (lang.scope != null ? getLanguageScopeLabel(lang.scope) : null),
            field: Field.LanguageScope,
          },
          {
            key: 'Full Path',
            render: (lang) => <LanguagePath path={getLanguagePath(lang)} />,
            exportValue: (lang) => formatLanguagePath(getLanguagePath(lang)),
          },
        ]}
        entities={languagesWithIssues}
      />
    </>
  );
};

const LanguagePath: React.FC<{ path: LanguageData[] }> = ({ path }) => {
  const compact = path.map((lang) => getScopeChar(lang.scope)).join('/');

  return <Hoverable hoverContent={<ExpandedLanguagePath path={path} />}>{compact}</Hoverable>;
};

const ExpandedLanguagePath: React.FC<{ path: LanguageData[] }> = ({ path }) => (
  <>
    {path.map((lang, index) => (
      <React.Fragment key={lang.ID}>
        {index > 0 && ' > '}
        <HoverableObjectName object={lang} /> [{lang.codeDisplay}]
      </React.Fragment>
    ))}
  </>
);

function getScopeChar(scope: LanguageScope | undefined): string {
  switch (scope) {
    case LanguageScope.Family:
      return 'F';
    case LanguageScope.Macrolanguage:
      return 'M';
    case LanguageScope.Language:
      return 'I';
    case LanguageScope.Dialect:
      return 'D';
    case LanguageScope.SpecialCode:
      return 'S';
    default:
      return '?';
  }
}

function formatLanguagePath(path: LanguageData[]): string {
  return path.map((lang) => `${lang.nameDisplay} [${lang.codeDisplay}]`).join(' > ');
}

export default ReportLanguageScopeIssues;
