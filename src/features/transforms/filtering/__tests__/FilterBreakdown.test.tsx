import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { VitalityEthnologueFine } from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterBreakdown from '../FilterBreakdown';

import { getMockLanguages } from './mockLanguagesForFilterTest.test';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));

describe('FilterBreakdown', () => {
  let updatePageParams: (params: PageParamsOptional) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: PageParamsOptional = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockParams();
  });

  it('shows loading message when no objects are provided', () => {
    render(<FilterBreakdown objects={[]} />);
    expect(
      screen.getByText(
        /Data is still loading\. If you are waiting awhile there could be an error in the data\./i,
      ),
    ).toBeTruthy();
  });

  it('returns an empty fragment when nothing is filtered', () => {
    const objects = getMockLanguages();
    setupMockParams({
      languageScopes: [],
      territoryFilter: '',
      writingSystemFilter: '',
      languageFilter: '',
      vitalityEthFine: [],
      searchString: '',
    });
    const { container } = render(<FilterBreakdown objects={objects} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breakdown counts and clear buttons; clicking clears calls updatePageParams', () => {
    const objects = getMockLanguages();
    setupMockParams({
      territoryFilter: 'US',
      writingSystemFilter: 'Latn',
      languageFilter: 'ine', // Indo-European family
      vitalityEthFine: [VitalityEthnologueFine.National],
      searchString: 'spa',
    });

    const { container } = render(<FilterBreakdown objects={objects} />);

    // Expected all of the filters to be shown
    expect(screen.getByText(/Not macrolanguage or language:/i)).toBeTruthy();
    expect(screen.getByText(/Not found in territory with code "US":/i)).toBeTruthy();
    expect(screen.getByText(/Not written in script with code "Latn":/i)).toBeTruthy();
    expect(screen.getByText(/Not related to language with code "ine":/i)).toBeTruthy();
    expect(screen.getByText(/Not passing vitality filter:/i)).toBeTruthy();
    expect(screen.getByText(/Not matching substring "spa":/i)).toBeTruthy();

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(8);
    expect(numericCells[0].textContent).toBe('10'); // start out with 8 languages
    expect(numericCells[1].textContent).toBe('-2'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('-3'); // deu, ita, zho are not in US in the test data
    expect(numericCells[3].textContent).toBe('-1'); // rus is not written in the Latin script
    expect(numericCells[4].textContent).toBe('-1'); // nav is not in the Indo-European language family
    expect(numericCells[5].textContent).toBe('-1'); // fra fails vitality "National"
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
    const objects = getMockLanguages();
    setupMockParams({
      territoryFilter: 'US',
      vitalityEthFine: [VitalityEthnologueFine.National],
      searchString: 'spa',
    });

    render(<FilterBreakdown objects={objects} shouldFilterUsingSearchBar={false} />);

    // Since substring filtering is disabled, the "Not matching substring" line should not be present
    expect(screen.queryByText(/Not matching substring/i)).toBeNull();

    // Other counts should not indicate substring filtering; there should be no substring clear button
    const buttons = screen.getAllByRole('button');
    // Only scope/territory/vitality clears may exist depending on counts; ensure updatePageParams callable
    if (buttons.length > 0) {
      fireEvent.click(buttons[0]);
      expect(updatePageParams).toHaveBeenCalledWith({ languageScopes: [] });
    }
  });

  it('shows a subset of the possible filters when only some affect the objects shown', () => {
    const objects = getMockLanguages();
    setupMockParams({});
    const { container } = render(<FilterBreakdown objects={objects} />);

    // No filters are applied, so no breakdown should be shown
    expect(screen.queryByText(/Not macrolanguage or language:/i)).toBeTruthy(); // ine
    expect(screen.queryByText(/Not found in territory/i)).toBeNull(); // not active
    expect(screen.queryByText(/Not written in/i)).toBeNull(); // not active
    expect(screen.queryByText(/Not related to/i)).toBeNull(); // not active
    expect(screen.queryByText(/Not passing vitality filter/i)).toBeNull(); // not active
    expect(screen.queryByText(/Not matching substring/i)).toBeNull(); // not active

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('count');
    expect(numericCells.length).toBe(3);
    expect(numericCells[0].textContent).toBe('10'); // total languages
    expect(numericCells[1].textContent).toBe('-2'); // ine, gem is out of scope: Language or Macrolanguage
    expect(numericCells[2].textContent).toBe('8'); // resulting languages
  });

  it('when filters are written out, renders the readable names and not the codes', () => {
    const objects = getMockLanguages();
    setupMockParams({
      territoryFilter: 'United States [US]',
      writingSystemFilter: 'Latin [Latn]',
      languageFilter: 'Indo-European [ine]',
    });

    const { container } = render(<FilterBreakdown objects={objects} />);

    // Expected all of the filters to be shown
    expect(screen.getByText(/Not macrolanguage or language:/i)).toBeTruthy();
    expect(screen.getByText(/Not found in United States:/i)).toBeTruthy();
    expect(screen.getByText(/Not written in Latin:/i)).toBeTruthy();
    expect(screen.getByText(/Not related to Indo-European:/i)).toBeTruthy();

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
