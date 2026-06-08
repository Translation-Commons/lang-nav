import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';

import { LanguageData } from '@entities/language/LanguageTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import {
  getCombinedLanguagePath,
  getLanguageScopeIssues,
  LanguageScopeIssue,
} from './getLanguageScopeIssues';

function getCombinedCode(lang: LanguageData): string {
  return lang.Combined.code ?? lang.ID;
}

function getCombinedName(lang: LanguageData): string {
  return lang.Combined.name ?? lang.nameCanonical;
}

function getCombinedScopeLabel(lang: LanguageData): string {
  return getLanguageScopeLabel(lang.Combined.scope ?? lang.scope);
}

const ReportLanguageScopeIssues: React.FC = () => {
  const { allLanguoids } = useDataContext();

  const issues = useMemo(() => getLanguageScopeIssues(allLanguoids), [allLanguoids]);
  const issueByChildId = useMemo(
    () => new Map(issues.map((issue) => [issue.child.ID, issue])),
    [issues],
  );
  const languagesWithIssues = useMemo(() => issues.map((issue) => issue.child), [issues]);

  return (
    <>
      This report analyzes the Combined language hierarchy and flags direct parent-child pairs where
      the parent and child scopes look inconsistent after merging ISO, Glottolog, and TC data. It
      always uses the Combined source, regardless of the selected language source.
      <InteractiveObjectTable<LanguageData>
        tableID={TableID.LanguageScopeIssues}
        shouldFilterUsingSearchBar={false}
        columns={[
          {
            key: 'Issue Type',
            render: (lang: LanguageData) => issueByChildId.get(lang.ID)?.issueType,
          },
          {
            key: 'Parent Code',
            render: (lang: LanguageData) => {
              const parent = issueByChildId.get(lang.ID)?.parent;
              return parent != null ? getCombinedCode(parent) : null;
            },
          },
          {
            key: 'Parent Name',
            render: (lang: LanguageData) => {
              const parent = issueByChildId.get(lang.ID)?.parent;
              return parent != null ? <HoverableObjectName object={parent} /> : null;
            },
            exportValue: (lang: LanguageData) => {
              const parent = issueByChildId.get(lang.ID)?.parent;
              return parent != null ? getCombinedName(parent) : null;
            },
          },
          {
            key: 'Parent Scope',
            render: (lang: LanguageData) => {
              const parent = issueByChildId.get(lang.ID)?.parent;
              return parent != null ? getCombinedScopeLabel(parent) : null;
            },
          },
          {
            key: 'Child Code',
            render: (lang: LanguageData) => getCombinedCode(lang),
          },
          {
            key: 'Child Name',
            render: (lang: LanguageData) => <HoverableObjectName object={lang} />,
            exportValue: (lang: LanguageData) => getCombinedName(lang),
          },
          {
            key: 'Child Scope',
            render: (lang: LanguageData) => getCombinedScopeLabel(lang),
          },
          {
            key: 'Full Path',
            render: (lang: LanguageData) => (
              <CombinedLanguagePath issue={issueByChildId.get(lang.ID)} />
            ),
            exportValue: (lang: LanguageData) =>
              formatCombinedLanguagePath(getCombinedLanguagePath(lang)),
          },
          {
            key: 'Suggested Override',
            render: (lang: LanguageData) => issueByChildId.get(lang.ID)?.suggestedOverride,
          },
        ]}
        objects={languagesWithIssues}
      />
    </>
  );
};

const CombinedLanguagePath: React.FC<{ issue?: LanguageScopeIssue }> = ({ issue }) => {
  if (issue == null) return null;

  return (
    <>
      {issue.fullPath.map((lang, index) => (
        <React.Fragment key={lang.ID}>
          {index > 0 && ' > '}
          <HoverableObjectName object={lang} /> [{getCombinedCode(lang)}]
        </React.Fragment>
      ))}
    </>
  );
};

function formatCombinedLanguagePath(path: LanguageData[]): string {
  return path.map((lang) => `${getCombinedName(lang)} [${getCombinedCode(lang)}]`).join(' > ');
}

export default ReportLanguageScopeIssues;
