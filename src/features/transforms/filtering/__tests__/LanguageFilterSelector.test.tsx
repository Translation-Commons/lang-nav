import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import LanguageFilterSelector from '../LanguageFilterSelector';

import { getMockLanguages } from './mockLanguagesForFilterTest.test';

const mockUpdatePageParams = vi.fn();

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));

// mock useDataContext to return languages
vi.mock('@features/data/context/useDataContext', () => ({
  // [ine, gem, eng, spa, fra, deu, ita, rus, nav, zho]
  useDataContext: vi.fn(() => ({
    languagesInSelectedSource: getMockLanguages(),
  })),
}));

// Import component under test after mocks are defined
describe('LanguageFilterSelector', () => {
  let updatePageParams: (params: PageParamsOptional) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: PageParamsOptional = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  beforeEach(() => {
    setupMockParams();
    mockUpdatePageParams.mockReset();
  });

  it('basically renders', () => {
    render(<LanguageFilterSelector />);
    expect(screen.getByText(/Language/)).toBeTruthy();
  });

  it('suggests all languages when no search string is provided', async () => {
    const user = userEvent.setup();
    render(<LanguageFilterSelector />);

    const input = screen.getByPlaceholderText('Name or code');
    // click to trigger getSuggestions('') and await
    await user.click(input);

    // After click the mocked TextInput will render suggestion items
    const items = screen.getByRole('listbox').children;
    // Expect all 10 languages to be suggested and that the languages come first
    expect(items.length).toBe(10);
    expect(items[0]).toHaveTextContent('English');
    expect(items[1]).toHaveTextContent('Spanish');
    expect(items[2]).toHaveTextContent('French');
    expect(items[3]).toHaveTextContent('German');
    expect(items[4]).toHaveTextContent('Italian');
    expect(items[5]).toHaveTextContent('Russian');
    expect(items[6]).toHaveTextContent('Navajo');
    expect(items[7]).toHaveTextContent('Chinese');
    expect(items[8]).toHaveTextContent('Indo-European languages');
    expect(items[9]).toHaveTextContent('Germanic');
    // User types in German, suggestions should filter to German and Germanic
    await user.type(input, 'German');
    expect(items.length).toBe(2);
    expect(items[0]).toHaveTextContent('German');
    expect(items[1]).toHaveTextContent('Germanic');
    expect(updatePageParams).not.toHaveBeenCalled(); // it is no longer automatically called after input

    // User clicks on German, the button text should update and updatePageParams called
    await user.click(items[0]);
    await new Promise((r) => setTimeout(r, 400)); // wait for debounce
    expect(updatePageParams).toHaveBeenCalledWith({ languageFilter: 'German' });
  });

  it('without scope filter, language families appear in original order', async () => {
    setupMockParams({ languageScopes: [] });
    const user = userEvent.setup();
    render(<LanguageFilterSelector />);

    const btn = screen.getByPlaceholderText('Name or code');
    // click to trigger getSuggestions('') and await
    await user.click(btn);

    // After click the mocked TextInput will render suggestion items
    const items = screen.getByRole('listbox').children;
    // Expect all 10 languages to be suggested and that the languages come first
    expect(items.length).toBe(10);
    expect(items[0]).toHaveTextContent('Indo-European languages');
    expect(items[1]).toHaveTextContent('Germanic');
    expect(items[2]).toHaveTextContent('English');
    expect(items[3]).toHaveTextContent('Spanish');
    expect(items[4]).toHaveTextContent('French');
    expect(items[5]).toHaveTextContent('German');
    expect(items[6]).toHaveTextContent('Italian');
    expect(items[7]).toHaveTextContent('Russian');
    expect(items[8]).toHaveTextContent('Navajo');
    expect(items[9]).toHaveTextContent('Chinese');
  });
});
