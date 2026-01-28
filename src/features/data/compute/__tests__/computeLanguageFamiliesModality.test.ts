import { describe, expect, it } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import { LanguageModality } from '@entities/language/LanguageModality';
import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import computeLanguageFamiliesModality from '../computeLanguageFamiliesModality';

describe('computeLanguageFamiliesModality', () => {
  it('computes modalities for language families correctly', () => {
    // Family structure, no modalities assigned yet
    const ine = getBaseLanguageData('ine', 'Indo-European');
    const sla = getBaseLanguageData('sla', 'Slavic'); // no children
    sla.Combined.parentLanguageCode = 'ine';
    const bat = getBaseLanguageData('bat', 'Baltic'); // lav, lit, svx and lsl children
    bat.Combined.parentLanguageCode = 'ine';

    // Languages, all with modalities
    const lav = getBaseLanguageData('lav', 'Latvian');
    lav.Combined.parentLanguageCode = 'bat';
    lav.modality = LanguageModality.SpokenAndWritten;
    lav.populationRough = 1500000;
    const lit = getBaseLanguageData('lit', 'Lithuanian');
    lit.Combined.parentLanguageCode = 'bat';
    lit.modality = LanguageModality.SpokenAndWritten;
    lit.populationRough = 2800000;
    const ltg = getBaseLanguageData('ltg', 'Latgalian');
    ltg.Combined.parentLanguageCode = 'lav';
    ltg.modality = LanguageModality.MostlySpoken;
    ltg.populationRough = 200000;
    const svx = getBaseLanguageData('svx', 'Skalvian');
    svx.Combined.parentLanguageCode = 'bat';
    svx.modality = LanguageModality.MostlySpoken;
    svx.populationRough = 50000;
    const lsl = getBaseLanguageData('lsl', 'Latvian Sign Language');
    lsl.Combined.parentLanguageCode = 'lav';
    lsl.modality = LanguageModality.Sign;
    lsl.populationRough = 100000;

    const languages = { ine, sla, bat, lav, lit, ltg, svx, lsl };
    getFullyInstantiatedMockedObjects(languages);
    computeLanguageFamiliesModality(Object.values(languages));

    expect(ine.modality).toBe(LanguageModality.SpokenAndWritten);
    expect(bat.modality).toBe(LanguageModality.SpokenAndWritten);
  });

  it('can compute a mostly spoken modality', () => {
    const crp = getBaseLanguageData('crp', 'Creoles and Pidgins');
    const cpe = getBaseLanguageData('cpe', 'English-based Creoles and Pidgins');
    cpe.Combined.parentLanguageCode = 'crp';
    const tpi = getBaseLanguageData('tpi', 'Tok Pisin');
    tpi.Combined.parentLanguageCode = 'cpe';
    tpi.modality = LanguageModality.MostlySpoken;
    tpi.populationRough = 8000000;
    const lir = getBaseLanguageData('lir', 'Liberian English');
    lir.Combined.parentLanguageCode = 'cpe';
    lir.modality = LanguageModality.MostlySpoken;
    lir.populationRough = 3000000;
    const cpi = getBaseLanguageData('cpi', 'Chinese Pidgin English');
    cpi.Combined.parentLanguageCode = 'cpe';
    cpi.modality = LanguageModality.Spoken;
    cpi.populationRough = 5000;

    const languages = { crp, cpe, tpi, lir, cpi };
    getFullyInstantiatedMockedObjects(languages);
    computeLanguageFamiliesModality(Object.values(languages));

    expect(crp.modality).toBe(LanguageModality.MostlySpoken);
    expect(cpe.modality).toBe(LanguageModality.MostlySpoken);
  });

  it('averages languages with different modalities correctly', () => {
    const ara = getBaseLanguageData('ara', 'Arabic');
    const arb = getBaseLanguageData('arb', 'Standard Arabic');
    arb.Combined.parentLanguageCode = 'ara';
    arb.modality = LanguageModality.Written;
    arb.populationRough = 120000000;
    const ary = getBaseLanguageData('ary', 'Moroccan Arabic');
    ary.Combined.parentLanguageCode = 'ara';
    ary.modality = LanguageModality.MostlySpoken;
    ary.populationRough = 30000000;
    const arz = getBaseLanguageData('arz', 'Egyptian Arabic');
    arz.Combined.parentLanguageCode = 'ara';
    arz.modality = LanguageModality.MostlySpoken;
    arz.populationRough = 60000000;
    const arq = getBaseLanguageData('arq', 'Algerian Arabic');
    arq.Combined.parentLanguageCode = 'ara';
    arq.modality = LanguageModality.MostlySpoken;
    arq.populationRough = 40000000;
    const avl = getBaseLanguageData('avl', 'Eastern Egyptian Bedawi Arabic');
    avl.Combined.parentLanguageCode = 'ara';
    avl.modality = LanguageModality.Spoken;
    avl.populationRough = 1000000;

    const languages = { ara, arb, ary, arz, arq, avl };
    getFullyInstantiatedMockedObjects(languages);
    computeLanguageFamiliesModality(Object.values(languages));

    expect(ara.modality).toBe(LanguageModality.SpokenAndWritten);
    expect(arb.modality).toBe(LanguageModality.Written);
    expect(ary.modality).toBe(LanguageModality.MostlySpoken);
    expect(arz.modality).toBe(LanguageModality.MostlySpoken);
    expect(arq.modality).toBe(LanguageModality.MostlySpoken);
    expect(avl.modality).toBe(LanguageModality.Spoken);
  });

  it('can handle a sign language family', () => {
    const sgn = getBaseLanguageData('sgn', 'Sign Language'); // lsl as child
    const ase = getBaseLanguageData('ase', 'American Sign Language');
    ase.Combined.parentLanguageCode = 'sgn';
    ase.modality = LanguageModality.Sign;
    ase.populationRough = 100000;

    const languages = { sgn, ase };
    getFullyInstantiatedMockedObjects(languages);
    computeLanguageFamiliesModality(Object.values(languages));

    expect(sgn.modality).toBe(LanguageModality.Sign);
    expect(ase.modality).toBe(LanguageModality.Sign);
  });
});
