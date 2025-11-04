import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

import { ObjectType, PageParamsOptional } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import { getBaseLanguageData, LanguageScope } from '@entities/language/LanguageTypes';
import { VitalityEthnologueFine } from '@entities/language/vitality/VitalityTypes';
import { LocaleData, LocaleSource, TerritoryData, TerritoryScope } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterBreakdown from '../FilterBreakdown';

vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));

function getMockLanguages() {
  const US: TerritoryData = {
    ID: 'US',
    codeDisplay: 'US',
    nameDisplay: 'United States',
    names: ['United States', 'USA', 'US'],
    type: ObjectType.Territory,
    scope: TerritoryScope.Country,
    population: 331002651,
    populationFromUN: 331000000,
  };
  // To simplify, all languages share the same locale for the US
  const mul_US: LocaleData = {
    ID: 'mul_US',
    codeDisplay: 'mul_US',
    languageCode: 'mul',
    territoryCode: 'US',
    territory: US,
    nameDisplay: 'Multiple Languages (USA)',
    names: ['Multiple Languages'],
    type: ObjectType.Locale,
    localeSource: LocaleSource.CreateRegionalLocales,
  };

  const ine = getBaseLanguageData('ine', 'Indo-European languages');
  ine.scope = LanguageScope.Family;
  ine.locales = [mul_US];
  const eng = getBaseLanguageData('eng', 'English');
  eng.scope = LanguageScope.Language;
  eng.locales = [mul_US];
  eng.vitalityEth2013 = VitalityEthnologueFine.National;
  const spa = getBaseLanguageData('spa', 'Spanish');
  spa.scope = LanguageScope.Language;
  spa.locales = [mul_US];
  spa.vitalityEth2013 = VitalityEthnologueFine.National;
  const fra = getBaseLanguageData('fra', 'French');
  fra.scope = LanguageScope.Language;
  fra.locales = [mul_US];
  fra.vitalityEth2013 = VitalityEthnologueFine.Regional;
  const deu = getBaseLanguageData('deu', 'German');
  deu.scope = LanguageScope.Language;
  const ita = getBaseLanguageData('ita', 'Italian');
  ita.scope = LanguageScope.Language;
  const zho = getBaseLanguageData('zho', 'Chinese');
  zho.scope = LanguageScope.Macrolanguage;
  return [ine, eng, spa, fra, deu, ita, zho];
}

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
      vitalityEth2013: [],
      searchString: '',
    });
    const { container } = render(<FilterBreakdown objects={objects} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders breakdown counts and clear buttons; clicking clears calls updatePageParams', () => {
    const objects = getMockLanguages();
    setupMockParams({
      territoryFilter: 'US',
      vitalityEth2013: [VitalityEthnologueFine.National],
      searchString: 'spa',
    });

    const { container } = render(<FilterBreakdown objects={objects} />);

    // Expected all of the filters to be shown
    expect(screen.getByText(/Out of scope:/i)).toBeTruthy();
    expect(screen.getByText(/Not in territory \(US\):/i)).toBeTruthy();
    expect(screen.getByText(/Not passing vitality filter:/i)).toBeTruthy();
    expect(screen.getByText(/Not matching substring \(spa\):/i)).toBeTruthy();

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('numeric');
    expect(numericCells.length).toBe(4);
    expect(numericCells[0].textContent).toBe('1'); // ine is out of scope: Language or Macrolanguage
    expect(numericCells[1].textContent).toBe('3'); // deu, ita, zho are not in US in the test data
    expect(numericCells[2].textContent).toBe('1'); // fra fails vitality "National"
    expect(numericCells[3].textContent).toBe('1'); // eng fails substring "spa"

    // There should be four clear buttons (one per message)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(4);

    // Click each button and ensure updatePageParams is called with expected payload
    fireEvent.click(buttons[0]);
    expect(updatePageParams).toHaveBeenCalledWith({
      territoryScopes: [],
      languageScopes: [],
    });

    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);
    fireEvent.click(buttons[3]);

    expect(updatePageParams).toHaveBeenCalledTimes(4);
  });

  it('does not apply substring filter when shouldFilterUsingSearchBar is false', () => {
    const objects = getMockLanguages();
    setupMockParams({
      territoryFilter: 'US',
      vitalityEth2013: [VitalityEthnologueFine.National],
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
      expect(updatePageParams).toHaveBeenCalledWith({ territoryScopes: [], languageScopes: [] });
    }
  });

  it('shows a subset of the possible filters when only some affect the objects shown', () => {
    const objects = getMockLanguages();
    setupMockParams({});
    const { container } = render(<FilterBreakdown objects={objects} />);

    // No filters are applied, so no breakdown should be shown
    expect(screen.queryByText(/Out of scope:/i)).toBeTruthy(); // ine
    expect(screen.queryByText(/Not in territory/i)).toBeNull(); // not active
    expect(screen.queryByText(/Not passing vitality filter/i)).toBeNull(); // not active
    expect(screen.queryByText(/Not matching substring/i)).toBeNull(); // not active

    // Check the cells showing the missing counts
    const numericCells = container.getElementsByClassName('numeric');
    expect(numericCells.length).toBe(1);
    expect(numericCells[0].textContent).toBe('1'); // ine is out of scope: Language or Macrolanguage
  });
});
