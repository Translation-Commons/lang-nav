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

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn().mockReturnValue({ pathname: '/data' }),
}));
vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
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
    const buttons = screen.getAllByTestId('entity-suggestion-button');
    expect(buttons.length, 'buttons appear').toBeGreaterThan(0);
    const dropdownItems = screen.queryAllByTestId('entity-combobox-suggestion');
    expect(dropdownItems.length, 'dropdown is not visible yet').toBe(0);
  });

  it('suggests all languages when no search string is provided', async () => {
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const input = screen.getByPlaceholderText('Name or code');
    // Click to trigger getSuggestions('') and await
    await waitFor(async () => await user.click(input));

    // After click the mocked TextInput will render suggestion items
    const items = screen.getAllByTestId('entity-combobox-suggestion');
    const rows = [
      // Does not suggest language families
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Russian',
      'Esperanto',
      'Chinese',
    ];
    expect(items.length).toBe(rows.length);
    rows.forEach((text, i) => expect(items[i]).toHaveTextContent(text));

    // User types in German, suggestions should filter to German
    await waitFor(async () => await user.type(input, 'German'));
    const newItems = screen.getAllByTestId('entity-combobox-suggestion');
    expect(newItems.length).toBe(1);
    expect(newItems[0]).toHaveTextContent('German');

    // User clicks on German, the button text should update and updatePageParams called
    await waitFor(async () => await user.click(newItems[0]));
    expect(updatePageParams).toHaveBeenCalledWith({ languageFilter: 'deu' });
  });

  it('without scope filter, language families appear in original order', async () => {
    setupMockParams({ languageScopes: [] });
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    // After click the mocked TextInput will render suggestion items
    const buttons = screen.getAllByTestId('entity-suggestion-button');
    ['English', 'Spanish', 'French', 'German', 'Italian'].forEach((text, i) =>
      expect(buttons[i]).toHaveTextContent(text),
    );

    const btn = screen.getByPlaceholderText('Name or code');
    // Click to trigger getSuggestions('') and await
    await waitFor(async () => await user.click(btn));

    // After click the mocked TextInput will render suggestion items
    const items = screen.getAllByTestId('entity-combobox-suggestion');
    const rows = [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Russian',
      'Esperanto',
      'Chinese',
    ];
    expect(items.length).toBe(rows.length);
    rows.forEach((text, i) => expect(items[i]).toHaveTextContent(text));
  });

  it('when a language family is selected, results will partition languages in that family from ones not in that family', async () => {
    setupMockParams({ languageFamilyFilter: 'gem' });
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const btn = screen.getByPlaceholderText('Name or code');
    // Click to trigger getSuggestions('') and await
    await waitFor(async () => await user.click(btn));

    // After click the mocked TextInput will render suggestion items
    const items = screen.getAllByTestId('entity-combobox-suggestion');
    const rows = [
      'English',
      'German',
      // 'not related to language family with code "gem"',
      'Spanish',
      'French',
      'Italian',
      'Russian',
      'Esperanto',
      'Chinese',
    ];
    expect(items.length).toBe(rows.length);
    rows.forEach((text, i) => expect(items[i]).toHaveTextContent(text));
  });

  it('when macrolanguages are filtered out, they appear still, but lower in the suggestion list', async () => {
    setupMockParams({ languageScopes: [LanguageScope.Language] });
    const user = userEvent.setup();
    await waitFor(async () => render(<LanguageFilterSelector />));

    const btn = screen.getByPlaceholderText('Name or code');
    // Click to trigger getSuggestions('') and await
    await waitFor(async () => await user.click(btn));

    // After click the mocked TextInput will render suggestion items
    const items = screen.getAllByTestId('entity-combobox-suggestion');
    const rows = [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Russian',
      'Esperanto',
      // 'not individual language',
      'Chinese',
    ];
    expect(items.length).toBe(rows.length);
    rows.forEach((text, i) => expect(items[i]).toHaveTextContent(text));
  });
});
