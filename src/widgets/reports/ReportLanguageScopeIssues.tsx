import React, { useMemo } from 'react';

import { useDataContext } from '@features/data/context/useDataContext';
import Hoverable from '@features/layers/hovercard/Hoverable';
import HoverableEntityName from '@features/layers/hovercard/HoverableEntityName';
import InteractiveEntityTable from '@features/table/InteractiveEntityTable';
import TableID from '@features/table/TableID';
import Field from '@features/transforms/fields/Field';

import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

import { filterLanguagesWithScopeIssues, getLanguagePath } from './getLanguageScopeIssues';

const ReportLanguageScopeIssues: React.FC = () => {
  const { languagesInSelectedSource, getLanguage } = useDataContext();

  const languagesWithIssues = useMemo(
    () => filterLanguagesWithScopeIssues(languagesInSelectedSource),
    [languagesInSelectedSource],
  );

  return (
    <>
      This tool is meant to diagnose issues related to language ancestry & language levels. We
      expect a typical language lineage to look like this: F/f/f/M/L/D/D -- where F = Family, f =
      Subfamily, M = Macrolanguage, L = Individual Language, D = Dialect. In some cases the family
      may be superseded by a <strong>B</strong>roader grouping (like the regional group{' '}
      <HoverableEntityName ent={getLanguage('paa')} /> or a particular aspect like{' '}
      <HoverableEntityName ent={getLanguage('sgn')} /> ). Some sources offer a lot more language
      categories than ISO so languoids in between a Macrolanguage and a Language are classified{' '}
      <strong>I</strong>ntermediate.
      <InteractiveEntityTable<LanguageData>
        tableID={TableID.LanguageScopeIssues}
        shouldFilterUsingSearchBar={false}
        columns={[
          {
            key: 'Parent Code',
            render: (lang) => lang.parentLanguage?.codeDisplay,
          },
          {
            key: 'Parent Name',
            render: (lang) =>
              lang.parentLanguage != null ? (
                <HoverableEntityName ent={lang.parentLanguage} />
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
            render: (lang) => <HoverableEntityName ent={lang} />,
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
        ents={languagesWithIssues}
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
        <HoverableEntityName ent={lang} /> [{lang.codeDisplay}]
      </React.Fragment>
    ))}
  </>
);

function getScopeChar(scope: LanguageScope | undefined): string {
  switch (scope) {
    case LanguageScope.BroadGrouping:
      return 'B';
    case LanguageScope.Family:
      return 'F';
    case LanguageScope.Subfamily:
      return 'f';
    case LanguageScope.Macrolanguage:
      return 'M';
    case LanguageScope.Intermediate:
      return 'I';
    case LanguageScope.Language:
      return 'L';
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
