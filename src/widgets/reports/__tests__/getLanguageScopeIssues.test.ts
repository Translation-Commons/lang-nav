import { describe, expect, it } from 'vitest';

import { getBaseLanguageData, LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import { filterLanguagesWithScopeIssues, getLanguagePath } from '../getLanguageScopeIssues';

function makeLanguage(
  id: string,
  name: string,
  scope: LanguageScope,
  parentLanguage?: LanguageData,
): LanguageData {
  return {
    ...getBaseLanguageData(id, name),
    scope,
    parentLanguage,
    childLanguages: [],
  };
}

describe('filterLanguagesWithScopeIssues', () => {
  it('detects languages whose scope is broader than their parent', () => {
    const dialectParent = makeLanguage('dial1', 'Test Dialect Group', LanguageScope.Dialect);
    const individualChild = makeLanguage(
      'ind1',
      'Test Individual',
      LanguageScope.Language,
      dialectParent,
    );
    const macroChild = makeLanguage(
      'mac1',
      'Test Macro',
      LanguageScope.Macrolanguage,
      dialectParent,
    );
    const macroParent = makeLanguage('mac2', 'Another Macro', LanguageScope.Macrolanguage);
    const familyChild = makeLanguage('fam1', 'Test Family', LanguageScope.Family, macroParent);
    const individualParent = makeLanguage('ind2', 'Parent Individual', LanguageScope.Language);
    const familyChild2 = makeLanguage(
      'fam2',
      'Nested Family',
      LanguageScope.Family,
      individualParent,
    );

    dialectParent.childLanguages = [individualChild, macroChild];
    macroParent.childLanguages = [familyChild];
    individualParent.childLanguages = [familyChild2];

    const issues = filterLanguagesWithScopeIssues([
      dialectParent,
      individualChild,
      macroChild,
      macroParent,
      familyChild,
      individualParent,
      familyChild2,
    ]);

    expect(issues.map((lang) => lang.ID).sort()).toEqual(['fam1', 'fam2', 'ind1', 'mac1']);
  });

  it('builds the language path from root to child using parentLanguage', () => {
    const root = makeLanguage('fam-root', 'Root Family', LanguageScope.Family);
    const parent = makeLanguage('mac-root', 'Root Macro', LanguageScope.Macrolanguage, root);
    const child = makeLanguage('ind-root', 'Root Individual', LanguageScope.Language, parent);

    root.childLanguages = [parent];
    parent.childLanguages = [child];

    expect(getLanguagePath(child).map((lang) => lang.ID)).toEqual([
      'fam-root',
      'mac-root',
      'ind-root',
    ]);
  });

  it('ignores valid parent-child scope pairs', () => {
    const family = makeLanguage('fam-valid', 'Valid Family', LanguageScope.Family);
    const macro = makeLanguage('mac-valid', 'Valid Macro', LanguageScope.Macrolanguage, family);
    family.childLanguages = [macro];

    expect(filterLanguagesWithScopeIssues([family, macro])).toEqual([]);
  });

  it('ignores languages without a parent', () => {
    const family = makeLanguage('fam-orphan', 'Root Family', LanguageScope.Family);

    expect(filterLanguagesWithScopeIssues([family])).toEqual([]);
  });

  it('ignores languages with missing scope', () => {
    const parent = makeLanguage('par1', 'Parent', LanguageScope.Dialect);
    const childWithIssue = makeLanguage('child1', 'Child', LanguageScope.Language, parent);
    const childMissingScope: LanguageData = {
      ...getBaseLanguageData('child2', 'No Scope Child'),
      parentLanguage: parent,
      childLanguages: [],
    };

    expect(filterLanguagesWithScopeIssues([parent, childWithIssue, childMissingScope])).toEqual([
      childWithIssue,
    ]);
  });

  it('uses lang.parentLanguage and lang.scope instead of Combined fields', () => {
    const dialectParent = makeLanguage('par1', 'Parent', LanguageScope.Dialect);
    const child = makeLanguage('child1', 'Child', LanguageScope.Language, dialectParent);
    const validCombinedParent = makeLanguage('valid-par', 'Valid Parent', LanguageScope.Family);

    child.Combined.parentLanguage = validCombinedParent;
    child.Combined.scope = LanguageScope.Language;
    dialectParent.Combined.scope = LanguageScope.Dialect;

    expect(filterLanguagesWithScopeIssues([dialectParent, child, validCombinedParent])).toEqual([
      child,
    ]);
  });
});
