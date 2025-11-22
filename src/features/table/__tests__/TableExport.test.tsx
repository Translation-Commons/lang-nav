import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { CodeColumn, NameColumn } from '../CommonColumns';
import TableExport from '../TableExport';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams()),
}));
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn(), showHoverCard: vi.fn() }),
}));
vi.mock('@shared/hooks/useClickOutside', () => ({ useClickOutside: () => React.createRef() }));

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

  it('export buttons render correctly', async () => {
    render(<TableExport visibleColumns={columns} objectsFilteredAndSorted={objects} />);

    // The options aren't initially visible, also there is no generic Export option
    expect(screen.queryByText('Copy TSV')).not.toBeTruthy();
    expect(screen.queryByText('Download CSV')).not.toBeTruthy();
    expect(screen.queryByText('Export')).not.toBeTruthy();

    // Click export button to open the menu
    const button = screen.queryByText('Export ▶');
    expect(button).toBeTruthy();
    act(() => {
      fireEvent.click(button!);
    });

    // Ensure options are now visible
    expect(screen.queryByText('Copy TSV')).toBeTruthy();
    expect(screen.queryByText('Download CSV')).toBeTruthy();
    expect(screen.queryByText('Export')).not.toBeTruthy();
  });

  // Note: Downloading requires too many document APIs not available in jsdom/vitest,
  // so we only test copying to clipboard here.

  it('copies tsv format data to clipboard when Copy TSV is clicked', async () => {
    render(<TableExport visibleColumns={columns} objectsFilteredAndSorted={objects} />);

    // Open the menu to show `Copy TSV` option
    act(() => {
      fireEvent.click(screen.getByText('Export ▶'));
    });

    // Clicking on Copy TSV will copy data to clipboard
    // Ensure navigator.clipboard exists in the test environment (jsdom/vitest may not provide it)
    if (!('clipboard' in navigator)) {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
      });
    }
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    const copyTsvOption = screen.getByText('Copy TSV');
    act(() => {
      fireEvent.click(copyTsvOption);
    });
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(
        'ID\tName\neng\tEnglish\nfra\tFrench\nspa\tSpanish',
      );
    });
  });
});
