import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageScope } from '@entities/language/LanguageTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import { getMockLanguages } from '../../__tests__/mockLanguagesForFilterTest.test';
import LanguageFilterSelector from '../LanguageFilterSelector';

const mockUpdatePageParams = vi.fn();

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

// mock useDataContext to return languages
vi.mock('@features/data/context/useDataContext', () => ({
  // [ine, gem, eng, spa, fra, deu, ita, rus, nav, zho]
  useDataContext: vi.fn(() => ({
    languagesInSelectedSource: getMockLanguages(),
  })),
}));

// Reads the visible suggestion labels (role="option") in DOM order.
const optionTexts = () => screen.getAllByRole('option').map((o) => o.textContent ?? '');

// Import component under test after mocks are defined
describe('LanguageFilterSelector', () => {
  let updatePageParams: (params: Partial<PageParams>) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  beforeEach(() => {
    setupMockParams();
    mockUpdatePageParams.mockReset();
  });

  it('basically renders', async () => {
    await waitFor(async () => render(<LanguageFilterSelector />));
    expect(screen.getByText(/Language/)).toBeTruthy();
  });

  it('suggests all languages when no search string is provided', async () => {
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const input = screen.getByPlaceholderText('Name or code');
    await waitFor(async () => await user.click(input));

    // Language families (ine, gem) are excluded; individual languages appear in population order.
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(8));
    const expectedOrder = [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Russian',
      'Navajo',
      'Chinese',
    ];
    optionTexts().forEach((text, i) => expect(text).toContain(expectedOrder[i]));

    // Typing filters to the matching language; pressing Enter submits the typed value.
    await waitFor(async () => await user.type(input, 'German'));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(optionTexts()[0]).toContain('German');
    expect(updatePageParams).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');
    expect(updatePageParams).toHaveBeenCalledWith({ languageFilter: 'German' });
  });

  it('without scope filter, language families appear in original order', async () => {
    setupMockParams({ languageScopes: [] });
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const input = screen.getByPlaceholderText('Name or code');
    await waitFor(async () => await user.click(input));

    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(8));
    const expectedOrder = [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Russian',
      'Navajo',
      'Chinese',
    ];
    optionTexts().forEach((text, i) => expect(text).toContain(expectedOrder[i]));
  });

  it('when a language family is selected, results partition languages in that family from ones not in it', async () => {
    setupMockParams({ languageFamilyFilter: 'gem' });
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const input = screen.getByPlaceholderText('Name or code');
    await waitFor(async () => await user.click(input));

    // Germanic languages (English, German) come first, then the partition label, then the rest.
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(8));
    const expectedOrder = [
      'English',
      'German',
      'Spanish',
      'French',
      'Italian',
      'Russian',
      'Navajo',
      'Chinese',
    ];
    optionTexts().forEach((text, i) => expect(text).toContain(expectedOrder[i]));
    expect(screen.getByText('not related to language family with code "gem"')).toBeInTheDocument();
  });

  it('when macrolanguages are filtered out, they appear still, but lower in the suggestion list', async () => {
    setupMockParams({ languageScopes: [LanguageScope.Language] });
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const input = screen.getByPlaceholderText('Name or code');
    await waitFor(async () => await user.click(input));

    // Navajo (an individual language) stays before the partition; Chinese (a macrolanguage) drops below it.
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(8));
    const expectedOrder = [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Russian',
      'Navajo',
      'Chinese',
    ];
    optionTexts().forEach((text, i) => expect(text).toContain(expectedOrder[i]));
    expect(screen.getByText('not individual language')).toBeInTheDocument();
  });
});
