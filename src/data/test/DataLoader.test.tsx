import { describe, expect, it } from 'vitest';

import { loadLanguages, loadLocales, loadWritingSystems } from '../DataLoader';

describe('loadLocales', () => {
  it('loads locales without error', async () => {
    const locales = await loadLocales();
    expect(locales).not.toBeNull();
    if (!locales) return; // For TypeScript
    expect(Object.values(locales).length).toBeGreaterThan(10000);
  });
});

describe('loadLanguages', () => {
  it('loads languages without error', async () => {
    const languages = await loadLanguages();
    expect(languages).not.toBeNull();
    if (!languages) return; // For TypeScript
    expect(Object.values(languages).length).toBeGreaterThan(7000);
  });
});

describe('loadWritingSystems', () => {
  it('loads writing systems without error', async () => {
    const writingSystems = await loadWritingSystems();
    expect(writingSystems).not.toBeNull();
    if (!writingSystems) return; // For TypeScript
    expect(Object.values(writingSystems).length).toBeGreaterThan(200);
  });
});
