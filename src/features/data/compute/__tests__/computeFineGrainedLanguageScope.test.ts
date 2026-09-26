import { describe, expect, it } from 'vitest';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';

import computeFineGrainedLanguageScope from '../computeFineGrainedLanguageScope';

/** Indo-European > Germanic, both Families in the raw data, linked only in Combined. */
function getFamilies() {
  const ine = getBaseLanguageData('ine', 'Indo-European');
  const gem = getBaseLanguageData('gem', 'Germanic');
  ine.Combined = { scope: LanguageScope.Family, childLanguages: [gem] };
  gem.Combined = { scope: LanguageScope.Family, parentLanguage: ine, childLanguages: [] };
  ine.scope = LanguageScope.Family;
  gem.scope = LanguageScope.Family;
  return { ine, gem };
}

describe('computeFineGrainedLanguageScope', () => {
  it('makes a family inside a family a subfamily', () => {
    const { ine, gem } = getFamilies();
    gem.parentLanguage = ine; // loaded while Combined is the active source
    computeFineGrainedLanguageScope([ine, gem]);
    expect(gem.Combined.scope).toBe(LanguageScope.Subfamily);
    expect(ine.Combined.scope).toBe(LanguageScope.Family);
  });

  it('gives the same Combined result when the active source has no parent link', () => {
    const { ine, gem } = getFamilies();
    gem.parentLanguage = undefined; // loaded while a source without this link was active
    computeFineGrainedLanguageScope([ine, gem]);
    expect(gem.Combined.scope).toBe(LanguageScope.Subfamily);
  });
});
