import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearAmplitudeCookies,
  clearAmplitudeLocalStorage,
  clearAmplitudeStorage,
} from '../amplitude';

function clearAllCookies() {
  for (const entry of document.cookie.split(';')) {
    const name = entry.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

describe('clearAmplitudeLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes keys with the AMP_ prefix', () => {
    localStorage.setItem('AMP_abcdef1234', 'device-id-payload');
    clearAmplitudeLocalStorage();
    expect(localStorage.getItem('AMP_abcdef1234')).toBeNull();
  });

  it('removes keys with the amplitude_ prefix (unsent event buffers)', () => {
    localStorage.setItem('amplitude_unsent_abcdef1234', '[{"event_type":"x"}]');
    localStorage.setItem('amplitude_unsent_identify_abcdef1234', '[]');
    clearAmplitudeLocalStorage();
    expect(localStorage.getItem('amplitude_unsent_abcdef1234')).toBeNull();
    expect(localStorage.getItem('amplitude_unsent_identify_abcdef1234')).toBeNull();
  });

  it('is case-insensitive on the prefix', () => {
    localStorage.setItem('amp_session_replay', 'session-payload');
    localStorage.setItem('Amplitude_foo', 'bar');
    clearAmplitudeLocalStorage();
    expect(localStorage.getItem('amp_session_replay')).toBeNull();
    expect(localStorage.getItem('Amplitude_foo')).toBeNull();
  });

  it('leaves unrelated keys untouched', () => {
    localStorage.setItem('langnav.consent', '{"analytics":"granted"}');
    localStorage.setItem('user-theme', 'dark');
    localStorage.setItem('AMP_abcdef1234', 'device-id');

    clearAmplitudeLocalStorage();

    expect(localStorage.getItem('langnav.consent')).toBe('{"analytics":"granted"}');
    expect(localStorage.getItem('user-theme')).toBe('dark');
    expect(localStorage.getItem('AMP_abcdef1234')).toBeNull();
  });

  it('is a no-op when nothing Amplitude-shaped is stored', () => {
    localStorage.setItem('langnav.consent', '{}');
    expect(() => clearAmplitudeLocalStorage()).not.toThrow();
    expect(localStorage.getItem('langnav.consent')).toBe('{}');
  });
});

describe('clearAmplitudeCookies', () => {
  beforeEach(() => {
    clearAllCookies();
  });

  it('removes cookies with the AMP_ prefix', () => {
    document.cookie = 'AMP_abcdef1234=device-id; path=/';
    expect(document.cookie).toContain('AMP_abcdef1234');

    clearAmplitudeCookies();

    expect(document.cookie).not.toContain('AMP_abcdef1234');
  });

  it('removes the AMP_MKTG_ marketing cookie', () => {
    document.cookie = 'AMP_MKTG_abcdef1234=utm-payload; path=/';
    clearAmplitudeCookies();
    expect(document.cookie).not.toContain('AMP_MKTG_abcdef1234');
  });

  it('leaves unrelated cookies intact', () => {
    document.cookie = 'session=keep-me; path=/';
    document.cookie = 'AMP_abcdef1234=device; path=/';

    clearAmplitudeCookies();

    expect(document.cookie).toContain('session=keep-me');
    expect(document.cookie).not.toContain('AMP_abcdef1234');
  });

  it('is a no-op when no cookies are set', () => {
    expect(() => clearAmplitudeCookies()).not.toThrow();
  });
});

describe('clearAmplitudeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    clearAllCookies();
  });

  it('clears both localStorage entries and cookies in one call', () => {
    localStorage.setItem('AMP_abcdef1234', 'device-id');
    document.cookie = 'AMP_abcdef1234=cookie-device; path=/';

    clearAmplitudeStorage();

    expect(localStorage.getItem('AMP_abcdef1234')).toBeNull();
    expect(document.cookie).not.toContain('AMP_abcdef1234');
  });
});
