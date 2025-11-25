import { describe, expect, it } from 'vitest';

import {
  getLanguageRootLanguageFamily,
  getLanguageRootMacrolanguage,
} from '../LanguageFamilyUtils';
import { getBaseLanguageData, LanguageScope } from '../LanguageTypes';

function generateLanguages() {
  const afa = getBaseLanguageData('afa', 'Afro-Asiatic Languages');
  const sem = getBaseLanguageData('sem', 'Semitic Languages');
  const ara = getBaseLanguageData('ara', 'Arabic');
  const arb = getBaseLanguageData('arb', 'Standard Arabic');
  const nort3191 = getBaseLanguageData('nort3191', 'North African Arabic');
  const mey = getBaseLanguageData('mey', 'Hassiniyya');
  const moro1295 = getBaseLanguageData('moro1295', 'Moroccan-Andalusian Arabic');
  const ary = getBaseLanguageData('ary', 'Moroccan Arabic');
  const marr1264 = getBaseLanguageData('marr1264', 'Marrakech');
  const eus = getBaseLanguageData('eus', 'Basque'); // no parent language

  afa.scope = LanguageScope.Family;
  sem.scope = LanguageScope.Family;
  ara.scope = LanguageScope.Macrolanguage;
  arb.scope = LanguageScope.Dialect;
  nort3191.scope = LanguageScope.Family;
  mey.scope = LanguageScope.Dialect;
  moro1295.scope = LanguageScope.Family;
  ary.scope = LanguageScope.Dialect;
  marr1264.scope = LanguageScope.Dialect;
  eus.scope = LanguageScope.Language;

  sem.parentLanguage = afa;
  ara.parentLanguage = sem; // for simplicity
  arb.parentLanguage = ara;
  nort3191.parentLanguage = ara;
  mey.parentLanguage = nort3191;
  moro1295.parentLanguage = nort3191;
  ary.parentLanguage = moro1295;
  marr1264.parentLanguage = ary;

  sem.ISO.parentLanguage = afa;
  ara.ISO.parentLanguage = sem;
  arb.ISO.parentLanguage = ara;
  mey.ISO.parentLanguage = ara; // ISO groups Hassaniyya directly under Arabic
  ary.ISO.parentLanguage = ara;

  afa.ISO.scope = LanguageScope.Family;
  sem.ISO.scope = LanguageScope.Family;
  ara.ISO.scope = LanguageScope.Macrolanguage;
  arb.ISO.scope = LanguageScope.Dialect;
  mey.ISO.scope = LanguageScope.Dialect;
  ary.ISO.scope = LanguageScope.Dialect;

  // const
  return { ara, ary, afa, sem, mey, arb, eus, nort3191, moro1295, marr1264 };
}

describe('getLanguageRootLanguageFamily', () => {
  const languages = generateLanguages();

  it('returns the language itself if it has no parent', () => {
    const result = getLanguageRootLanguageFamily(languages.eus);
    expect(result.nameDisplay, 'Basque root').toBe('Basque');
  });

  it('returns the top-level family for a language with multiple levels of parents', () => {
    const result = getLanguageRootLanguageFamily(languages.ary);
    expect(result.nameDisplay, 'Moroccan Arabic root').toBe('Afro-Asiatic Languages');
    const result2 = getLanguageRootLanguageFamily(languages.mey);
    expect(result2.nameDisplay, 'Hassaniyya root').toBe('Afro-Asiatic Languages');
    const result3 = getLanguageRootLanguageFamily(languages.arb);
    expect(result3.nameDisplay, 'Standard Arabic root').toBe('Afro-Asiatic Languages');
  });

  it('returns the immediate parent if that parent has no parent', () => {
    const result = getLanguageRootLanguageFamily(languages.sem);
    expect(result.nameDisplay, 'Semitic Languages root').toBe('Afro-Asiatic Languages');
  });

  it('handles ISO parent languages correctly', () => {
    const result = getLanguageRootLanguageFamily(languages.mey);
    expect(result.nameDisplay, 'Hassaniyya root').toBe('Afro-Asiatic Languages');
  });

  it('returns the language itself if it is a top-level family', () => {
    const result = getLanguageRootLanguageFamily(languages.afa);
    expect(result.nameDisplay, 'Afro-Asiatic Languages root').toBe('Afro-Asiatic Languages');
  });

  it('handles non-ISO languoids correctly', () => {
    const result = getLanguageRootLanguageFamily(languages.nort3191);
    expect(result.nameDisplay, 'North African Arabic root').toBe('Afro-Asiatic Languages');
    const result2 = getLanguageRootLanguageFamily(languages.moro1295);
    expect(result2.nameDisplay, 'Moroccan-Andalusian Arabic root').toBe('Afro-Asiatic Languages');
    const result3 = getLanguageRootLanguageFamily(languages.marr1264);
    expect(result3.nameDisplay, 'Marrakesh Arabic root').toBe('Afro-Asiatic Languages');
  });
});

describe('getLanguageRootMacrolanguage', () => {
  const languages = generateLanguages();

  it('languages without macrolanguages return nothing', () => {
    const result = getLanguageRootMacrolanguage(languages.eus);
    expect(result?.nameDisplay, 'Basque macrolanguage').toBeUndefined();
  });

  it('high level language families are not in a macrolanguage', () => {
    const result = getLanguageRootMacrolanguage(languages.afa);
    expect(result?.nameDisplay, 'Afro-Asiatic Languages macrolanguage').toBeUndefined();
    const result2 = getLanguageRootMacrolanguage(languages.sem);
    expect(result2?.nameDisplay, 'Semitic Languages macrolanguage').toBeUndefined();
  });

  it('language families may be contained by an ISO macrolanguage', () => {
    const result = getLanguageRootMacrolanguage(languages.moro1295);
    expect(result?.nameDisplay, 'Moroccan-Andalusian Arabic macrolanguage').toBe('Arabic');
    const result2 = getLanguageRootMacrolanguage(languages.nort3191);
    expect(result2?.nameDisplay, 'North African Arabic macrolanguage').toBe('Arabic');
  });

  it('ISO languages directly under a macrolanguage return that macrolanguage', () => {
    const result = getLanguageRootMacrolanguage(languages.arb);
    expect(result?.nameDisplay, 'Standard Arabic macrolanguage').toBe('Arabic');
  });

  it('ISO languages with Glottolog parents can still return a macrolanguage if they have an ISO parent', () => {
    const result = getLanguageRootMacrolanguage(languages.mey);
    expect(result?.nameDisplay, 'Hassaniyya macrolanguage').toBe('Arabic');
    const result2 = getLanguageRootMacrolanguage(languages.ary);
    expect(result2?.nameDisplay, 'Moroccan Arabic macrolanguage').toBe('Arabic');
  });

  it('dialects can return their macrolanguage via their parent language', () => {
    const result = getLanguageRootMacrolanguage(languages.marr1264);
    expect(result?.nameDisplay, 'Marrakesh Arabic macrolanguage').toBe('Arabic');
  });
});
