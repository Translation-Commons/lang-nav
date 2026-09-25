import { LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

const REASSIGNABLE_SCOPES = [
  LanguageScope.Family,
  LanguageScope.Subfamily,
  LanguageScope.Intermediate,
  LanguageScope.Dialect,
];

/**
 * Merging multiple sources, we end up with weird orderings of language scopes. For example,
 * a Macrolanguage can include a Language Family which includes a Dialect which includes a Language.
 *
 * This smoothes this out, using the Macrolanguages as anchor points.
 *   Anything between a family & macro is a subfamily. (and any root subfamily is a family)
 *   Anything between a macro & an individual language is "intermediate".
 *   Anything below a language should be a dialect.
 *
 * Other corrections should be done directly with `languageScopeOverrides.tsv`
 */
function computeFineGrainedLanguageScope(languages: LanguageData[]): void {
  // For each language family root
  languages.filter((lang) => !lang.parentLanguage).forEach((lang) => computeScopeRecursively(lang));
}

function computeScopeRecursively(lang: LanguageData, depth: number = 0): LanguageScope | undefined {
  if (depth > 30) {
    console.warn(
      'computeScopeRecursively exceeded max depth of 30, possible circular reference for language',
      lang,
    );
    return undefined;
  }

  // While we are recursing, we can also reassign the scope of the language based on its parent's scope
  reassignLanguageScope(lang);

  // Compute the scope of every language in the subtree
  const childScopes = lang.Combined.childLanguages?.map((child) =>
    computeScopeRecursively(child, depth + 1),
  );

  // Look for the highest scope found among the child languages (used to determine if node should be intermediate or dialect)
  if (lang.scope === LanguageScope.Intermediate) {
    const highestChildScope = childScopes?.reduce(
      (prev, curr) => (curr && (!prev || curr > prev) ? curr : prev),
      undefined,
    );
    if (!highestChildScope || highestChildScope === LanguageScope.Dialect) {
      lang.scope = LanguageScope.Dialect;
      lang.Combined.scope = LanguageScope.Dialect;
    }
  }

  // Return this languoid's scope
  return lang.scope;
}

// LangNav breaks down the language scope into more fine-grained labels to account for differences in standards
function reassignLanguageScope(lang: LanguageData): void {
  if (!!lang.scope && !REASSIGNABLE_SCOPES.includes(lang.scope)) return;

  // Reassign the scope of the language
  const parentScope = lang.parentLanguage?.scope;
  let newScope: LanguageScope | undefined;
  switch (parentScope ?? LanguageScope.BroadGrouping) {
    case LanguageScope.BroadGrouping:
      if (lang.scope === LanguageScope.Subfamily) newScope = LanguageScope.Family;
      break;
    case LanguageScope.Family:
      if (lang.scope === LanguageScope.Family) newScope = LanguageScope.Subfamily;
      break;
    case LanguageScope.Subfamily:
      if (lang.scope !== LanguageScope.Dialect) newScope = LanguageScope.Subfamily;
      break;
    case LanguageScope.Macrolanguage:
    case LanguageScope.Intermediate:
      newScope = LanguageScope.Intermediate;
      break;
    case LanguageScope.Language:
      // Not reassigning right now
      break;
    default:
      break;
  }

  if (newScope) {
    lang.scope = newScope;
    lang.Combined.scope = newScope;
  }
}

export default computeFineGrainedLanguageScope;
