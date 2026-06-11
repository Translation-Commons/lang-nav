import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import HoverableObjectName from '@features/layers/hovercard/HoverableObjectName';
import InteractiveObjectTable from '@features/table/InteractiveObjectTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { LanguageData } from '@entities/language/LanguageTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { getLanguagePath, getLanguageScopeIssues } from './getLanguageScopeIssues';

const ReportLanguageScopeIssues: React.FC = () => {
  const { languagesInSelectedSource } = useDataContext();

  const languagesWithIssues = useMemo(
    () => getLanguageScopeIssues(languagesInSelectedSource),
    [languagesInSelectedSource],
  );

  return (
    <>
      This report flags languages in the current language source whose scope is broader than their
      direct parent&apos;s scope, which may indicate a hierarchy inconsistency.
      <InteractiveObjectTable<LanguageData>
        tableID={TableID.LanguageScopeIssues}
        shouldFilterUsingSearchBar={false}
        columns={[
          {
            key: 'Parent Code',
            render: (lang) => lang.parentLanguage?.codeDisplay,
            exportValue: (lang) => lang.parentLanguage?.codeDisplay,
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
            exportValue: (lang) =>
              lang.parentLanguage?.scope != null
                ? getLanguageScopeLabel(lang.parentLanguage.scope)
                : null,
          },
          {
            key: 'Child Code',
            render: (lang) => lang.codeDisplay,
            exportValue: (lang) => lang.codeDisplay,
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
            exportValue: (lang) => (lang.scope != null ? getLanguageScopeLabel(lang.scope) : null),
            field: Field.LanguageScope,
          },
          {
            key: 'Full Path',
            render: (lang) => <LanguagePath path={getLanguagePath(lang)} />,
            exportValue: (lang) => formatLanguagePath(getLanguagePath(lang)),
          },
        ]}
        objects={languagesWithIssues}
      />
    </>
  );
};

const LanguagePath: React.FC<{ path: LanguageData[] }> = ({ path }) => (
  <>
    {path.map((lang, index) => (
      <React.Fragment key={lang.ID}>
        {index > 0 && ' > '}
        <HoverableObjectName object={lang} /> [{lang.codeDisplay}]
      </React.Fragment>
    ))}
  </>
);

function formatLanguagePath(path: LanguageData[]): string {
  return path.map((lang) => `${lang.nameDisplay} [${lang.codeDisplay}]`).join(' > ');
}

export default ReportLanguageScopeIssues;
