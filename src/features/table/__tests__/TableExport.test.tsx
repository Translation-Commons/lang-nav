import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { CodeColumn, NameColumn } from '../CommonColumns';
import TableExport from '../TableExport';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams()),
}));

describe('TableExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const columns = [CodeColumn, NameColumn];

  const objects = [
    getBaseLanguageData('eng', 'English'),
    getBaseLanguageData('fra', 'French'),
    getBaseLanguageData('spa', 'Spanish'),
  ];

  it('export options are hidden until the menu is opened', async () => {
    const user = userEvent.setup();
    render(<TableExport visibleColumns={columns} entities={objects} />);

    // The export options are not visible until the dropdown is opened.
    expect(screen.queryByRole('option', { name: /Copy TSV/ })).toBeNull();
    expect(screen.queryByRole('option', { name: /Download CSV/ })).toBeNull();

    // Open the dropdown menu.
    await user.click(screen.getByRole('combobox'));

    // Ensure options are now visible.
    expect(await screen.findByRole('option', { name: /Copy TSV/ })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Download CSV/ })).toBeTruthy();
  });

  // Note: Downloading requires too many document APIs not available in jsdom/vitest,
  // so we only test copying to clipboard here.

  it('copies tsv format data to clipboard when Copy TSV is clicked', async () => {
    const user = userEvent.setup();
    render(<TableExport visibleColumns={columns} entities={objects} />);

    // Open the menu to show `Copy TSV` option
    await user.click(screen.getByRole('combobox'));

    // Clicking on Copy TSV will copy data to clipboard
    // Ensure navigator.clipboard exists in the test environment (jsdom/vitest may not provide it)
    if (!('clipboard' in navigator)) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
      });
    }
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    await user.click(await screen.findByRole('option', { name: /Copy TSV/ }));
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(
        'ID\tName\neng\tEnglish\nfra\tFrench\nspa\tSpanish',
      );
    });
  });
});
