import { describe, expect, it } from 'vitest';

import { OfficialStatus } from '@entities/locale/LocaleTypes';

import { parseLocaleLine } from '../loadLocales';

const line = (status: string) =>
  ['tfn_US', 'Tanaina (United States)', 'Denaʼina Qenaga', 'Official', '90', status].join('\t');

describe('parseLocaleLine', () => {
  it('trims padding around the official status', () => {
    expect(parseLocaleLine(line('official_regional '))?.officialStatus).toBe(
      OfficialStatus.OfficialRegionally,
    );
  });

  it('treats a blank official status as missing', () => {
    expect(parseLocaleLine(line(' '))?.officialStatus).toBeUndefined();
  });
});
