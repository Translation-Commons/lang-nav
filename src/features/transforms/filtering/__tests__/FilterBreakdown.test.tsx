import { render, screen } from '@testing-library/react';
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
  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
  };

  const expectRow = async (text: string, exists: boolean = true) => {
    if (exists) {
      const buttons = await screen.findAllByTestId('FilterButton');
      expect(buttons.some((button) => new RegExp(text).test(button.textContent ?? ''))).toBe(true);
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
    render(<FilterBreakdown ents={[]} />);
    // find header text "All languages, language families, and dialects"
    expect(screen.queryByText(/All languages, language families, and dialects/i)).toBeTruthy();
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

    // Only had the total row
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(1);
    expect(numericCells[0].textContent).toBe('10'); // start out with 10 languages
  });

  it('renders breakdown counts', () => {
    const ents = getMockLanguages();
    setupMockParams({
      territoryFilter: '[US]',
      writingSystemFilter: '[Latn]',
      languageFamilyFilter: '[ine]', // Indo-European family
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
    expect(numericCells.length).toBe(7);
    expect(numericCells[0].textContent).toBe('10'); // start out with 8 languages
    expect(numericCells[1].textContent).toBe('8'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('5'); // deu, ita, zho are not in US in the test data
    expect(numericCells[3].textContent).toBe('4'); // rus is not written in the Latin script
    expect(numericCells[4].textContent).toBe('3'); // nav is not in the Indo-European language family
    expect(numericCells[5].textContent).toBe('2'); // fra fails the ISO vitality filter
    expect(numericCells[6].textContent).toBe('1'); // eng fails substring "spa"

    // No more clear buttons
  });

  it('shows a subset of the possible filters when only some affect the entities shown', () => {
    const ents = getMockLanguages();
    setupMockParams({});
    const { container } = render(<FilterBreakdown ents={ents} />);

    // No filters are applied, so only the default filter is shown, no others
    expectRow('Macrolanguage or Individual Language');
    expectRow('found in territory', false);
    expectRow('written in', false);
    expectRow('related to', false);
    expectRow('Living', false);
    expectRow('matching substring', false);

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(2);
    expect(numericCells[0].textContent).toBe('10'); // total languages
    expect(numericCells[1].textContent).toBe('8'); // ine, gem is out of scope: Language or Macrolanguage
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
    expect(numericCells.length).toBe(5);
    expect(numericCells[0].textContent).toBe('10'); // start out with 8 languages
    expect(numericCells[1].textContent).toBe('8'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('5'); // deu, ita, zho are not in US in the test data
    expect(numericCells[3].textContent).toBe('4'); // rus is not written in the Latin script
    expect(numericCells[4].textContent).toBe('3'); // nav is not in the Indo-European language family
  });
});
