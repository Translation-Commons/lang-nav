import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { HoverCardProvider } from '@widgets/HoverCardContext';

import {
  ObjectType,
  LocaleSeparator,
  View,
  SearchableField,
  PageParams,
  PageParamsOptional,
} from '@features/page-params/PageParamTypes';
import { ProfileType } from '@features/page-params/Profiles';
import * as PageParamsHook from '@features/page-params/usePageParams';
import { SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  getVitalityISOLabel,
  getVitalityEthnologueFineLabel,
  getVitalityEthnologueCoarseLabel,
} from '@entities/language/vitality/VitalityStrings';
import {
  VitalityISO,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

import {
  VitalityISOSelector,
  VitalityEth2013Selector,
  VitalityEth2025Selector,
} from '../VitalitySelector';

vi.mock('@features/page-params/usePageParams', () => ({
  usePageParams: vi.fn(),
}));

type PageParamsContextState = PageParams & {
  updatePageParams: (updates: PageParamsOptional) => void;
};

const mockUpdatePageParams = vi.fn();

// Shared mock state generator
const createMockState = (
  vitality: {
    vitalityISO?: VitalityISO[];
    vitalityEth2013?: VitalityEthnologueFine[];
    vitalityEth2025?: VitalityEthnologueCoarse[];
  } = {},
): PageParamsContextState => ({
  vitalityISO: vitality.vitalityISO ?? [],
  vitalityEth2013: vitality.vitalityEth2013 ?? [],
  vitalityEth2025: vitality.vitalityEth2025 ?? [],
  updatePageParams: mockUpdatePageParams,
  languageScopes: [],
  languageSource: LanguageSource.ISO,
  limit: 10,
  localeSeparator: LocaleSeparator.Underscore,
  objectType: ObjectType.Language,
  page: 0,
  profile: 'default' as ProfileType,
  searchBy: SearchableField.NameOrCode,
  searchString: '',
  sortBehavior: SortBehavior.Normal,
  sortBy: SortBy.Name,
  territoryFilter: '',
  territoryScopes: [],
  view: View.CardList,
});

describe('VitalitySelector', () => {
  beforeEach(() => {
    vi.mocked(PageParamsHook.usePageParams).mockReturnValue(createMockState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three vitality selectors', () => {
    render(
      <HoverCardProvider>
        <>
          <VitalityISOSelector />
          <VitalityEth2013Selector />
          <VitalityEth2025Selector />
        </>
      </HoverCardProvider>,
    );

    expect(screen.getByText('ISO Language Status')).toBeInTheDocument();
    expect(screen.getByText('Ethnologue 2013 Status')).toBeInTheDocument();
    expect(screen.getByText('Ethnologue 2025 Status')).toBeInTheDocument();
  });

  describe('VitalityISOSelector', () => {
    it('displays all ISO vitality options', () => {
      render(
        <HoverCardProvider>
          <VitalityISOSelector />
        </HoverCardProvider>,
      );
      const expected = Object.values(VitalityISO).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getVitalityISOLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(
        <HoverCardProvider>
          <VitalityISOSelector />
        </HoverCardProvider>,
      );

      // Test selection
      const livingButton = screen.getByRole('button', { name: 'Living' });
      expect(livingButton).toHaveClass('selectorOption unselected');
      await user.click(livingButton);
      expect(mockUpdatePageParams).toHaveBeenCalledWith({
        vitalityISO: [VitalityISO.Living],
      });

      // Update mock to simulate selected state and rerender
      vi.mocked(PageParamsHook.usePageParams).mockReturnValue(
        createMockState({ vitalityISO: [VitalityISO.Living] }),
      );

      rerender(
        <HoverCardProvider>
          <VitalityISOSelector />
        </HoverCardProvider>,
      );

      // Test deselection
      const selectedLivingButton = screen.getByRole('button', { name: 'Living' });
      expect(selectedLivingButton).toHaveClass('selectorOption selected');
      await user.click(selectedLivingButton);
      expect(mockUpdatePageParams).toHaveBeenCalledWith({
        vitalityISO: [],
      });
    });
  });

  describe('VitalityEth2013Selector', () => {
    it('displays all Ethnologue 2013 vitality options', () => {
      render(
        <HoverCardProvider>
          <VitalityEth2013Selector />
        </HoverCardProvider>,
      );

      const expected = Object.values(VitalityEthnologueFine).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getVitalityEthnologueFineLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(
        <HoverCardProvider>
          <VitalityEth2013Selector />
        </HoverCardProvider>,
      );

      // Test selection
      const nationalButton = screen.getByRole('button', { name: 'National' });
      expect(nationalButton).toHaveClass('selectorOption unselected');
      await user.click(nationalButton);
      expect(mockUpdatePageParams).toHaveBeenCalledWith({
        vitalityEth2013: [VitalityEthnologueFine.National],
      });

      // Update mock to simulate selected state and rerender
      vi.mocked(PageParamsHook.usePageParams).mockReturnValue(
        createMockState({ vitalityEth2013: [VitalityEthnologueFine.National] }),
      );

      rerender(
        <HoverCardProvider>
          <VitalityEth2013Selector />
        </HoverCardProvider>,
      );

      // Test deselection
      const selectedNational = screen.getByRole('button', { name: 'National' });
      expect(selectedNational).toHaveClass('selectorOption selected');

      // Reset the mock to ensure we only track new calls
      mockUpdatePageParams.mockClear();

      // Click to deselect
      await user.click(selectedNational);

      // Verify the expected state after deselection
      expect(mockUpdatePageParams).toHaveBeenCalledWith({
        vitalityEth2013: [],
      });
    });
  });

  describe('VitalityEth2025Selector', () => {
    it('displays all Ethnologue 2025 vitality options', () => {
      render(
        <HoverCardProvider>
          <VitalityEth2025Selector />
        </HoverCardProvider>,
      );

      const expected = Object.values(VitalityEthnologueCoarse).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getVitalityEthnologueCoarseLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(
        <HoverCardProvider>
          <VitalityEth2025Selector />
        </HoverCardProvider>,
      );

      // Test selection
      const institutionalButton = screen.getByRole('button', { name: 'Institutional' });
      expect(institutionalButton).toHaveClass('selectorOption unselected');
      await user.click(institutionalButton);
      expect(mockUpdatePageParams).toHaveBeenCalledWith({
        vitalityEth2025: [VitalityEthnologueCoarse.Institutional],
      });

      // Update mock to simulate selected state and rerender
      vi.mocked(PageParamsHook.usePageParams).mockReturnValue(
        createMockState({ vitalityEth2025: [VitalityEthnologueCoarse.Institutional] }),
      );

      rerender(
        <HoverCardProvider>
          <VitalityEth2025Selector />
        </HoverCardProvider>,
      );

      // Test deselection
      const selectedInstitutional = screen.getByRole('button', { name: 'Institutional' });
      expect(selectedInstitutional).toHaveClass('selectorOption selected');

      // Reset the mock to ensure we only track new calls
      mockUpdatePageParams.mockClear();

      // Click to deselect
      await user.click(selectedInstitutional);

      // The mock should be called with empty array for deselection
      expect(mockUpdatePageParams).toHaveBeenCalledWith({
        vitalityEth2025: [],
      });
    });
  });
});
