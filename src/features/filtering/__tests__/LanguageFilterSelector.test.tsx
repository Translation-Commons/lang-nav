import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { PageParamsOptional } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import LanguageFilterSelector from '../LanguageFilterSelector';

import { getMockLanguages } from './mockLanguagesForFilterTest.test';

const mockUpdatePageParams = vi.fn();

vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));

// mock useDataContext to return languages
vi.mock('@features/data-loading/context/useDataContext', () => ({
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

    const btn = screen.getByPlaceholderText('Name or code');
    // click to trigger getSuggestions('') and await
    await user.click(btn);

    // After click the mocked TextInput will render suggestion items
    const items = screen.getByTestId('dropdown').children;
    // Expect all 10 languages to be suggested and that the languages come first
    expect(items.length).toBe(10);
    expect(items[0]).toHaveTextContent('English [eng]');
    expect(items[1]).toHaveTextContent('Spanish [spa]');
    expect(items[2]).toHaveTextContent('French [fra]');
    expect(items[3]).toHaveTextContent('German [deu]');
    expect(items[4]).toHaveTextContent('Italian [ita]');
    expect(items[5]).toHaveTextContent('Russian [rus]');
    expect(items[6]).toHaveTextContent('Navajo [nav]');
    expect(items[7]).toHaveTextContent('Chinese [zho]');
    expect(items[8]).toHaveTextContent('Indo-European languages [ine]');
    expect(items[9]).toHaveTextContent('Germanic [gem]');

    // User types in German, suggestions should filter to German and Germanic
    await user.type(btn, 'German');
    expect(items.length).toBe(2);
    expect(items[0]).toHaveTextContent('German [deu]');
    expect(items[1]).toHaveTextContent('Germanic [gem]');
    await new Promise((r) => setTimeout(r, 400)); // wait for debounce
    expect(updatePageParams).toHaveBeenCalledWith({ languageFilter: 'German' });

    // User clicks on German, the button text should update and updatePageParams called
    await user.click(items[0]);
    await new Promise((r) => setTimeout(r, 400)); // wait for debounce
    expect(updatePageParams).toHaveBeenCalledWith({ languageFilter: 'German [deu]' });
  });

  it('without scope filter, language families appear in original order', async () => {
    setupMockParams({ languageScopes: [] });
    const user = userEvent.setup();
    render(<LanguageFilterSelector />);

    const btn = screen.getByPlaceholderText('Name or code');
    // click to trigger getSuggestions('') and await
    await user.click(btn);

    // After click the mocked TextInput will render suggestion items
    const items = screen.getByTestId('dropdown').children;
    // Expect all 10 languages to be suggested and that the languages come first
    expect(items.length).toBe(10);
    expect(items[0]).toHaveTextContent('Indo-European languages [ine]');
    expect(items[1]).toHaveTextContent('Germanic [gem]');
    expect(items[2]).toHaveTextContent('English [eng]');
    expect(items[3]).toHaveTextContent('Spanish [spa]');
    expect(items[4]).toHaveTextContent('French [fra]');
    expect(items[5]).toHaveTextContent('German [deu]');
    expect(items[6]).toHaveTextContent('Italian [ita]');
    expect(items[7]).toHaveTextContent('Russian [rus]');
    expect(items[8]).toHaveTextContent('Navajo [nav]');
    expect(items[9]).toHaveTextContent('Chinese [zho]');
  });
});
