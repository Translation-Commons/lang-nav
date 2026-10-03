import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterBreakdown from '../FilterBreakdown';

import { getMockLanguages } from './mockLanguagesForFilterTest.test';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));
// Provide the display names used by the filter labels.
vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: () => ({
    getEntity: (id: string) => {
      const names: Record<string, string> = {
        US: 'United States',
        ine: 'Indo-European',
        Latn: 'Latin',
      };
      return names[id] ? { nameDisplay: names[id] } : undefined;
    },
  }),
}));

describe('FilterBreakdown', () => {
  let updatePageParams: (params: Partial<PageParams>) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  const expectRow = (text: string, exists: boolean = true) => {
    if (exists) {
      expect(screen.getByRole('cell', { name: new RegExp(text) })).toBeTruthy();
    } else {
      expect(
        screen.queryByText(
          (_, element) =>
            element?.tagName === 'TD' &&
            RegExp('Not\\s*' + text, 'i').test(element.textContent ?? ''),
        ),
      ).toBeNull();
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockParams();
  });

  it('renders nothing when no entities are provided', () => {
    const { container } = render(<FilterBreakdown ents={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns an empty fragment when nothing is filtered', () => {
    const ents = getMockLanguages();
    setupMockParams({
      languageScopes: [],
      territoryFilter: '',
      writingSystemFilter: '',
      languageFilter: '',
      languageFamilyFilter: '',
      isoStatus: [],
      searchString: '',
    });
    const { container } = render(<FilterBreakdown ents={ents} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breakdown counts and clear buttons; clicking clears calls updatePageParams', () => {
    const ents = getMockLanguages();
    setupMockParams({
      territoryFilter: 'US',
      writingSystemFilter: 'Latn',
      languageFamilyFilter: 'ine', // Indo-European family
      isoStatus: [LanguageISOStatus.Living], // filters out fra
      searchString: 'spa',
    });

    const { container } = render(<FilterBreakdown ents={ents} />);

    // Expected all of the filters to be shown
    expectRow('Macrolanguage or Individual Language');
    expectRow('found in United States');
    expectRow('written in Latin');
    expectRow('related to Indo-European');
    expectRow('Living');
    expectRow('Code & All Names matching "spa"');

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(8);
    expect(numericCells[0].textContent).toBe('10'); // start out with 8 languages
    expect(numericCells[1].textContent).toBe('-2'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('-3'); // deu, ita, zho are not in US in the test data
    expect(numericCells[3].textContent).toBe('-1'); // rus is not written in the Latin script
    expect(numericCells[4].textContent).toBe('-1'); // nav is not in the Indo-European language family
    expect(numericCells[5].textContent).toBe('-1'); // fra fails the ISO vitality filter
    expect(numericCells[6].textContent).toBe('-1'); // eng fails substring "spa"
    expect(numericCells[7].textContent).toBe('1'); // spa is the only language left

    // There should be six clear buttons (one per message)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(6);

    // Click each button and ensure updatePageParams is called with expected payload
    fireEvent.click(buttons[0]);
    expect(updatePageParams).toHaveBeenCalledWith({ languageScopes: [] });

    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);
    fireEvent.click(buttons[3]);
    fireEvent.click(buttons[4]);
    fireEvent.click(buttons[5]);

    expect(updatePageParams).toHaveBeenCalledTimes(6);
  });

  it('does not apply substring filter when shouldFilterUsingSearchBar is false', () => {
    const ents = getMockLanguages();
    setupMockParams({
      territoryFilter: 'US',
      isoStatus: [LanguageISOStatus.Living],
      searchString: 'spa',
    });

    render(<FilterBreakdown ents={ents} shouldFilterUsingSearchBar={false} />);

    // Since substring filtering is disabled, the "Not matching substring" line should not be present
    expectRow('Code & All Names matching "spa"', false);

    // Other counts should not indicate substring filtering; there should be no substring clear button
    const buttons = screen.getAllByRole('button');
    // Only scope/territory/vitality clears may exist depending on counts; ensure updatePageParams callable
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(updatePageParams).toHaveBeenCalledWith({ languageScopes: [] });
    }
  });

  it('shows a subset of the possible filters when only some affect the entities shown', () => {
    const ents = getMockLanguages();
    setupMockParams({});
    const { container } = render(<FilterBreakdown ents={ents} />);

    // No filters are applied, so no breakdown should be shown
    expectRow('Macrolanguage or Individual Language');
    expectRow('found in territory', false);
    expectRow('written in', false);
    expectRow('related to', false);
    expectRow('Living', false);
    expectRow('matching substring', false);

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(3);
    expect(numericCells[0].textContent).toBe('10'); // total languages
    expect(numericCells[1].textContent).toBe('-2'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('8'); // resulting languages
  });

  it('when filters are written out, renders the readable names and not the codes', () => {
    const ents = getMockLanguages();
    setupMockParams({
      territoryFilter: 'United States [US]',
      writingSystemFilter: 'Latin [Latn]',
      languageFamilyFilter: 'Indo-European [ine]',
    });

    const { container } = render(<FilterBreakdown ents={ents} />);

    // Expected all of the filters to be shown
    expectRow('Macrolanguage or Individual Language');
    expectRow('found in United States');
    expectRow('written in Latin');
    expectRow('related to Indo-European');

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(6);
    expect(numericCells[0].textContent).toBe('10'); // start out with 8 languages
    expect(numericCells[1].textContent).toBe('-2'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('-3'); // deu, ita, zho are not in US in the test data
    expect(numericCells[3].textContent).toBe('-1'); // rus is not written in the Latin script
    expect(numericCells[4].textContent).toBe('-1'); // nav is not in the Indo-European language family
    expect(numericCells[5].textContent).toBe('3'); // fra, eng, and spa are left

    // There should be four clear buttons (one per message)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);
  });
});
