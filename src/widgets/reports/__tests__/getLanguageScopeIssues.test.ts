import { describe, expect, it } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData, LanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import {
  getCombinedLanguagePath,
  getLanguageScopeIssues,
  getSuggestedOverride,
  LanguageScopeIssueType,
} from '../getLanguageScopeIssues';

function makeLanguage(
  id: string,
  name: string,
  scope: LanguageScope,
  parentLanguageCode?: string,
): LanguageData {
  return {
    ...getBaseLanguageData(id, name),
    scope,
    Combined: {
      code: id,
      name,
      scope,
      parentLanguageCode,
    },
  };
}

describe('getLanguageScopeIssues', () => {
  it('detects all direct parent-child scope issue types', () => {
    const dialectParent = makeLanguage('dial1', 'Test Dialect Group', LanguageScope.Dialect);
    const individualChild = makeLanguage(
      'ind1',
      'Test Individual',
      LanguageScope.Language,
      'dial1',
    );
    const macroChild = makeLanguage('mac1', 'Test Macro', LanguageScope.Macrolanguage, 'dial1');
    const macroParent = makeLanguage('mac2', 'Another Macro', LanguageScope.Macrolanguage);
    const familyChild = makeLanguage('fam1', 'Test Family', LanguageScope.Family, 'mac2');
    const individualParent = makeLanguage('ind2', 'Parent Individual', LanguageScope.Language);
    const familyChild2 = makeLanguage('fam2', 'Nested Family', LanguageScope.Family, 'ind2');

    const languages = [
      dialectParent,
      individualChild,
      macroChild,
      macroParent,
      familyChild,
      individualParent,
      familyChild2,
    ];

    dialectParent.Combined.childLanguages = [individualChild, macroChild];
    individualChild.Combined.parentLanguage = dialectParent;
    macroChild.Combined.parentLanguage = dialectParent;
    macroParent.Combined.childLanguages = [familyChild];
    familyChild.Combined.parentLanguage = macroParent;
    individualParent.Combined.childLanguages = [familyChild2];
    familyChild2.Combined.parentLanguage = individualParent;

    const issues = getLanguageScopeIssues(languages);

    expect(issues).toHaveLength(4);
    expect(issues.map((issue) => issue.issueType)).toEqual([
      LanguageScopeIssueType.DialectContainsIndividualLanguage,
      LanguageScopeIssueType.DialectContainsMacrolanguage,
      LanguageScopeIssueType.IndividualLanguageContainsFamily,
      LanguageScopeIssueType.MacrolanguageContainsFamily,
    ]);
  });

  it('builds the Combined path from root to child', () => {
    const root = makeLanguage('fam-root', 'Root Family', LanguageScope.Family);
    const parent = makeLanguage('mac-root', 'Root Macro', LanguageScope.Macrolanguage, 'fam-root');
    const child = makeLanguage('ind-root', 'Root Individual', LanguageScope.Language, 'mac-root');

    root.Combined.childLanguages = [parent];
    parent.Combined.parentLanguage = root;
    parent.Combined.childLanguages = [child];
    child.Combined.parentLanguage = parent;

    expect(getCombinedLanguagePath(child).map((lang) => lang.ID)).toEqual([
      'fam-root',
      'mac-root',
      'ind-root',
    ]);
  });

  it('ignores valid parent-child scope pairs', () => {
    const family = makeLanguage('fam-valid', 'Valid Family', LanguageScope.Family);
    const macro = makeLanguage(
      'mac-valid',
      'Valid Macro',
      LanguageScope.Macrolanguage,
      'fam-valid',
    );
    family.Combined.childLanguages = [macro];
    macro.Combined.parentLanguage = family;

    expect(getLanguageScopeIssues([family, macro])).toEqual([]);
  });

  it('ignores languages without Combined codes', () => {
    const parent = makeLanguage('par1', 'Parent', LanguageScope.Dialect);
    const child: LanguageData = {
      ...getBaseLanguageData('child1', 'Child'),
      type: ObjectType.Language,
      scope: LanguageScope.Language,
      Combined: {
        scope: LanguageScope.Language,
        parentLanguageCode: 'par1',
      },
    };
    parent.Combined.childLanguages = [child];
    child.Combined.parentLanguage = parent;

    expect(getLanguageScopeIssues([parent, child])).toEqual([]);
  });

  it('provides suggested overrides for each issue type', () => {
    expect(
      getSuggestedOverride(LanguageScopeIssueType.DialectContainsIndividualLanguage),
    ).toContain('Language Family');
    expect(getSuggestedOverride(LanguageScopeIssueType.MacrolanguageContainsFamily)).toContain(
      'Review whether the child Language Family',
    );
    expect(getSuggestedOverride(LanguageScopeIssueType.IndividualLanguageContainsFamily)).toContain(
      'Macrolanguage',
    );
  });
});
