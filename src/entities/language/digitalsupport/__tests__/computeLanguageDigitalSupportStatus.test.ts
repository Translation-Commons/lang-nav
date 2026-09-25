import { describe, expect, it } from 'vitest';

import { KeyboardData, KeyboardPlatform } from '@entities/keyboard/KeyboardTypes';
import { getBaseLanguageData, LanguageData } from '@entities/language/LanguageTypes';
import { CLDRCoverageData, CLDRCoverageLevel } from '@entities/types/CLDRTypes';
import { EntityType } from '@entities/types/EntityTypes';

import {
  getCLDRCoverage,
  getDigitalSupportStatus,
  getDigitalSupportStatusSeverity,
  getInterfacePlatforms,
} from '../computeLanguageDigitalSupportStatus';
import {
  DigitalSupportDimension,
  DigitalSupportStatus,
  PlatformSupportData,
  WikipediaData,
  WikipediaStatus,
} from '../DigitalSupportTypes';

function getPlatformSupport(name: string): PlatformSupportData {
  return { languageCodePath: 'tst', name };
}

function getKeyboard(ID: string): KeyboardData {
  return {
    type: EntityType.Keyboard,
    ID,
    codeDisplay: ID,
    nameDisplay: ID,
    names: [ID],
    platform: KeyboardPlatform.Keyman,
    languageCodes: ['tst'],
    inputScriptCode: 'Latn',
    outputScriptCode: 'Latn',
  };
}

function getWikipedia(status: WikipediaStatus): WikipediaData {
  return {
    titleEnglish: 'Test',
    titleLocal: 'Test',
    status,
    languageName: 'Test',
    scriptCodes: ['Latn'],
    wikipediaSubdomain: 'tst',
    localeCodes: 'tst',
    articles: 100,
    activeUsers: 10,
    url: 'tst.wikipedia.org',
  };
}

function getCoverage(actualCoverageLevel: CLDRCoverageLevel): CLDRCoverageData {
  return {
    countOfCLDRLocales: 1,
    targetCoverageLevel: actualCoverageLevel,
    actualCoverageLevel,
    inICU: true,
  };
}

function getLanguage(overrides: Partial<LanguageData> = {}): LanguageData {
  return Object.assign(getBaseLanguageData('tst', 'Test'), overrides);
}

describe('getDigitalSupportStatus', () => {
  describe('keyboards', () => {
    it('is not supported when there are no keyboards', () => {
      expect(getDigitalSupportStatus(getLanguage(), DigitalSupportDimension.Keyboards)).toEqual({
        status: DigitalSupportStatus.NotSupported,
        label: 'No keyboards',
      });
    });

    it('counts the available keyboards', () => {
      const lang = getLanguage({ keyboards: [getKeyboard('a'), getKeyboard('b')] });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Keyboards)).toEqual({
        status: DigitalSupportStatus.Supported,
        label: '2 keyboards',
      });
    });

    it('uses the singular for a single keyboard', () => {
      const lang = getLanguage({ keyboards: [getKeyboard('a')] });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Keyboards).label).toBe(
        '1 keyboard',
      );
    });
  });

  describe('machine translation', () => {
    it('is not supported without a Google Translate entry', () => {
      expect(
        getDigitalSupportStatus(getLanguage(), DigitalSupportDimension.MachineTranslation),
      ).toEqual({ status: DigitalSupportStatus.NotSupported, label: 'Not supported' });
    });

    it('names the provider when supported', () => {
      const lang = getLanguage({ googleTranslate: [getPlatformSupport('Test')] });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.MachineTranslation)).toEqual({
        status: DigitalSupportStatus.Supported,
        label: 'Google Translate',
      });
    });
  });

  describe('interfaces', () => {
    it('reports no platforms as not supported', () => {
      expect(getDigitalSupportStatus(getLanguage(), DigitalSupportDimension.Interfaces)).toEqual({
        status: DigitalSupportStatus.NotSupported,
        label: '0 of 4 platforms',
      });
    });

    it('reports some platforms as partial', () => {
      const lang = getLanguage({ macos: [getPlatformSupport('Test')] });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Interfaces)).toEqual({
        status: DigitalSupportStatus.Partial,
        label: '1 of 4 platforms',
      });
    });

    it('reports every platform as supported', () => {
      const lang = getLanguage({
        win11LanguagePacks: [getPlatformSupport('Test')],
        android: [getPlatformSupport('Test')],
        macos: [getPlatformSupport('Test')],
        ios: [getPlatformSupport('Test')],
      });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Interfaces)).toEqual({
        status: DigitalSupportStatus.Supported,
        label: '4 of 4 platforms',
      });
    });
  });

  describe('documentation', () => {
    it('is supported with both an active Wikipedia and a UDHR translation', () => {
      const lang = getLanguage({
        wikipedias: [getWikipedia(WikipediaStatus.Active)],
        udhr: [{ languageCodePath: 'tst', name: 'Test', variant: '', documentURL: 'test' }],
      });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Documentation)).toEqual({
        status: DigitalSupportStatus.Supported,
        label: 'Wikipedia and UDHR',
      });
    });

    it('is partial with only an active Wikipedia', () => {
      const lang = getLanguage({ wikipedias: [getWikipedia(WikipediaStatus.Active)] });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Documentation)).toEqual({
        status: DigitalSupportStatus.Partial,
        label: 'Wikipedia only',
      });
    });

    it('is partial with only a UDHR translation', () => {
      const lang = getLanguage({
        udhr: [{ languageCodePath: 'tst', name: 'Test', variant: '', documentURL: 'test' }],
      });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Documentation)).toEqual({
        status: DigitalSupportStatus.Partial,
        label: 'UDHR only',
      });
    });

    it('mentions an incubator Wikipedia alongside a UDHR translation', () => {
      const lang = getLanguage({
        wikipedias: [getWikipedia(WikipediaStatus.Incubator)],
        udhr: [{ languageCodePath: 'tst', name: 'Test', variant: '', documentURL: 'test' }],
      });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Documentation)).toEqual({
        status: DigitalSupportStatus.Partial,
        label: 'UDHR, incubator Wikipedia',
      });
    });

    it('is partial with only a closed Wikipedia', () => {
      const lang = getLanguage({ wikipedias: [getWikipedia(WikipediaStatus.Closed)] });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Documentation)).toEqual({
        status: DigitalSupportStatus.Partial,
        label: 'Closed Wikipedia only',
      });
    });

    it('is not supported without either', () => {
      expect(getDigitalSupportStatus(getLanguage(), DigitalSupportDimension.Documentation)).toEqual(
        { status: DigitalSupportStatus.NotSupported, label: 'No Wikipedia or UDHR' },
      );
    });
  });

  describe('i18n frameworks', () => {
    it('is not supported when the language is missing from CLDR', () => {
      expect(
        getDigitalSupportStatus(getLanguage(), DigitalSupportDimension.I18nFrameworks),
      ).toEqual({ status: DigitalSupportStatus.NotSupported, label: 'Not in CLDR' });
    });

    it.each([
      [CLDRCoverageLevel.Modern, DigitalSupportStatus.Supported, 'Modern CLDR coverage'],
      [CLDRCoverageLevel.Moderate, DigitalSupportStatus.Supported, 'Moderate CLDR coverage'],
      [CLDRCoverageLevel.Basic, DigitalSupportStatus.Partial, 'Basic CLDR only'],
      [CLDRCoverageLevel.Core, DigitalSupportStatus.Partial, 'Core CLDR only'],
      [CLDRCoverageLevel.Unknown, DigitalSupportStatus.Unknown, 'CLDR coverage unknown'],
    ])('maps coverage level %s', (level, status, label) => {
      const lang = getLanguage();
      lang.CLDR.coverage = getCoverage(level);
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.I18nFrameworks)).toEqual({
        status,
        label,
      });
    });

    it('falls back to the CLDR data provider', () => {
      const provider = getLanguage();
      provider.CLDR.coverage = getCoverage(CLDRCoverageLevel.Basic);
      const lang = getLanguage();
      lang.CLDR.dataProvider = provider;

      expect(getCLDRCoverage(lang)).toBe(provider.CLDR.coverage);
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.I18nFrameworks).label).toBe(
        'Basic CLDR only',
      );
    });
  });

  describe('overall', () => {
    it('is not supported when every category is missing', () => {
      expect(getDigitalSupportStatus(getLanguage(), DigitalSupportDimension.Overall)).toEqual({
        status: DigitalSupportStatus.NotSupported,
        label: '0 of 5 categories supported',
      });
    });

    it('counts the fully supported categories', () => {
      const lang = getLanguage({
        keyboards: [getKeyboard('a')],
        macos: [getPlatformSupport('Test')],
      });
      expect(getDigitalSupportStatus(lang, DigitalSupportDimension.Overall)).toEqual({
        status: DigitalSupportStatus.Partial,
        label: '1 of 5 categories supported',
      });
    });
  });
});

describe('getInterfacePlatforms', () => {
  it('lists the four operating systems that the data covers', () => {
    expect(getInterfacePlatforms(getLanguage()).map(({ label }) => label)).toEqual([
      'Windows 11',
      'Android',
      'MacOS',
      'iOS',
    ]);
  });
});

describe('getDigitalSupportStatusSeverity', () => {
  it('sorts gaps before supported capabilities', () => {
    const sorted = [
      DigitalSupportStatus.Supported,
      DigitalSupportStatus.Unknown,
      DigitalSupportStatus.NotSupported,
      DigitalSupportStatus.Partial,
    ].sort((a, b) => getDigitalSupportStatusSeverity(a) - getDigitalSupportStatusSeverity(b));

    expect(sorted).toEqual([
      DigitalSupportStatus.NotSupported,
      DigitalSupportStatus.Partial,
      DigitalSupportStatus.Unknown,
      DigitalSupportStatus.Supported,
    ]);
  });
});
