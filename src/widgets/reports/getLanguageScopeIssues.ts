import { LanguageData } from '@entities/language/LanguageTypes';

export function getLanguagePath(child: LanguageData): LanguageData[] {
  const path: LanguageData[] = [];
  const visited = new Set<string>();
  let current: LanguageData | undefined = child;

  while (current != null) {
    if (visited.has(current.ID)) break;
    visited.add(current.ID);
    path.unshift(current);
    current = current.parentLanguage;
  }

  return path;
}

export function getLanguageScopeIssues(languages: LanguageData[]): LanguageData[] {
  return languages
    .filter((lang) => {
      const parent = lang.parentLanguage;
      if (parent == null) return false;

      const parentScope = parent.scope;
      const childScope = lang.scope;
      if (parentScope == null || childScope == null) return false;

      // LanguageScope uses higher values for broader scopes (Family=5 > Dialect=2).
      // Flag when the child scope is broader than its parent's scope.
      return childScope > parentScope;
    })
    .sort((a, b) => a.ID.localeCompare(b.ID));
}
