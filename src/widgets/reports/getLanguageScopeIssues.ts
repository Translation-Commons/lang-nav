import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { getLanguageScopeLabel } from '@strings/LanguageScopeStrings';

export enum LanguageScopeIssueType {
  DialectContainsIndividualLanguage = 'Dialect contains Individual Language',
  DialectContainsMacrolanguage = 'Dialect contains Macrolanguage',
  MacrolanguageContainsFamily = 'Macrolanguage contains Family',
  IndividualLanguageContainsFamily = 'Individual Language contains Family',
}

export type LanguageScopeIssue = {
  issueType: LanguageScopeIssueType;
  parent: LanguageData;
  child: LanguageData;
  fullPath: LanguageData[];
  suggestedOverride: string;
};

function getCombinedScope(lang: LanguageData): LanguageScope | undefined {
  return lang.Combined.scope ?? lang.scope;
}

function detectIssueType(
  parentScope: LanguageScope,
  childScope: LanguageScope,
): LanguageScopeIssueType | undefined {
  if (parentScope === LanguageScope.Dialect && childScope === LanguageScope.Language) {
    return LanguageScopeIssueType.DialectContainsIndividualLanguage;
  }
  if (parentScope === LanguageScope.Dialect && childScope === LanguageScope.Macrolanguage) {
    return LanguageScopeIssueType.DialectContainsMacrolanguage;
  }
  if (parentScope === LanguageScope.Macrolanguage && childScope === LanguageScope.Family) {
    return LanguageScopeIssueType.MacrolanguageContainsFamily;
  }
  if (parentScope === LanguageScope.Language && childScope === LanguageScope.Family) {
    return LanguageScopeIssueType.IndividualLanguageContainsFamily;
  }
  return undefined;
}

export function getSuggestedOverride(issueType: LanguageScopeIssueType): string {
  switch (issueType) {
    case LanguageScopeIssueType.DialectContainsIndividualLanguage:
    case LanguageScopeIssueType.DialectContainsMacrolanguage:
      return `Change parent scope from ${getLanguageScopeLabel(LanguageScope.Dialect)} to ${getLanguageScopeLabel(LanguageScope.Family)}`;
    case LanguageScopeIssueType.MacrolanguageContainsFamily:
      return `Review whether the child ${getLanguageScopeLabel(LanguageScope.Family)} should remain ${getLanguageScopeLabel(LanguageScope.Family)} or whether an override is needed.`;
    case LanguageScopeIssueType.IndividualLanguageContainsFamily:
      return `Review whether the parent should be ${getLanguageScopeLabel(LanguageScope.Macrolanguage)} or whether the child ${getLanguageScopeLabel(LanguageScope.Family)} needs a different scope.`;
  }
}

export function getCombinedLanguagePath(child: LanguageData): LanguageData[] {
  const path: LanguageData[] = [];
  const visited = new Set<string>();
  let current: LanguageData | undefined = child;

  while (current != null) {
    if (visited.has(current.ID)) break;
    visited.add(current.ID);
    path.unshift(current);
    current = current.Combined.parentLanguage;
  }

  return path;
}

export function getLanguageScopeIssues(languages: LanguageData[]): LanguageScopeIssue[] {
  const issues: LanguageScopeIssue[] = [];

  languages.forEach((child) => {
    if (child.Combined.code == null) return;

    const parent = child.Combined.parentLanguage;
    if (parent == null) return;

    const parentScope = getCombinedScope(parent);
    const childScope = getCombinedScope(child);
    if (parentScope == null || childScope == null) return;

    const issueType = detectIssueType(parentScope, childScope);
    if (issueType == null) return;

    issues.push({
      issueType,
      parent,
      child,
      fullPath: getCombinedLanguagePath(child),
      suggestedOverride: getSuggestedOverride(issueType),
    });
  });

  return issues.sort((a, b) => {
    const typeCompare = a.issueType.localeCompare(b.issueType);
    if (typeCompare !== 0) return typeCompare;
    return a.child.ID.localeCompare(b.child.ID);
  });
}
