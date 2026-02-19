import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParamsOptional } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import {
  LanguageISOStatusSelector,
  VitalityEthCoarseSelector,
  VitalityEthFineSelector,
} from '../VitalitySelector';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/params/ui/SelectorDisplayContext', () => ({
  useSelectorDisplay: vi.fn().mockReturnValue({ display: 'buttonList' }),
  SelectorDisplay: { ButtonList: 'buttonList', Dropdown: 'dropdown' },
  SelectorDisplayProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({ hideHoverCard: vi.fn(), showHoverCard: vi.fn() }),
}));

describe('VitalitySelector', () => {
  let updatePageParams: (params: PageParamsOptional) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: PageParamsOptional = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  beforeEach(() => {
    setupMockParams();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three vitality selectors', () => {
    render(
      <>
        <LanguageISOStatusSelector />
        <VitalityEthFineSelector />
        <VitalityEthCoarseSelector />
      </>,
    );

    expect(screen.getByText('ISO Language Status')).toBeInTheDocument();
    expect(screen.queryByText('Vitality Eth (Fine)')).not.toBeInTheDocument();
    expect(screen.queryByText('Vitality Eth (Coarse)')).not.toBeInTheDocument();
  });

  describe('LanguageISOStatusSelector', () => {
    it('displays all ISO vitality options', () => {
      render(<LanguageISOStatusSelector />);
      const expected = Object.values(LanguageISOStatus).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getLanguageISOStatusLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(<LanguageISOStatusSelector />);

      // Test selection
      const livingButton = screen.getByRole('option', { name: 'Living' });
      expect(livingButton).toHaveClass('selectorOption unselected');
      await user.click(livingButton);
      expect(updatePageParams).toHaveBeenCalledWith({ isoStatus: [LanguageISOStatus.Living] });

      // Update mock to simulate selected state and rerender
      setupMockParams({ isoStatus: [LanguageISOStatus.Living] });

      rerender(<LanguageISOStatusSelector />);

      // Test deselection
      const selectedLivingButton = screen.getByRole('option', { name: 'Living' });
      expect(selectedLivingButton).toHaveClass('selectorOption selected');
      await user.click(selectedLivingButton);
      expect(updatePageParams).toHaveBeenCalledWith({ isoStatus: [] });
    });
  });

  // describe('VitalityEthFineSelector', () => {
  //   it('displays all Ethnologue fine vitality options', () => {
  //     render(<VitalityEthFineSelector />);

  //     const expected = Object.values(VitalityEthnologueFine).filter((v) => typeof v === 'number');

  //     expected.forEach((status) => {
  //       const label = getVitalityEthnologueFineLabel(status);
  //       expect(screen.getByText(label)).toBeInTheDocument();
  //     });
  //   });

  //   it('handles selection and deselection of options', async () => {
  //     const user = userEvent.setup();

  //     // Initial render with empty selection
  //     const { rerender } = render(<VitalityEthFineSelector />);

  //     // Test selection
  //     const nationalButton = screen.getByText('National');
  //     expect(nationalButton).toHaveClass('selectorOption unselected');
  //     await user.click(nationalButton);
  //     expect(updatePageParams).toHaveBeenCalledWith({
  //       vitalityEthFine: [VitalityEthnologueFine.National],
  //     });

  //     // Update mock to simulate selected state and rerender
  //     setupMockParams({ vitalityEthFine: [VitalityEthnologueFine.National] });

  //     rerender(<VitalityEthFineSelector />);

  //     // Test deselection
  //     const selectedNational = screen.getByText('National');
  //     expect(selectedNational).toHaveClass('selectorOption selected');

  //     // Click to deselect
  //     await user.click(selectedNational);

  //     // Verify the expected state after deselection
  //     expect(updatePageParams).toHaveBeenCalledWith({
  //       vitalityEthFine: [],
  //     });
  //   });
  // });

  // describe('VitalityEthCoarseSelector', () => {
  //   it('displays all Ethnologue 2025 vitality options', () => {
  //     render(<VitalityEthCoarseSelector />);

  //     const expected = Object.values(VitalityEthnologueCoarse).filter((v) => typeof v === 'number');

  //     expected.forEach((status) => {
  //       const label = getVitalityEthnologueCoarseLabel(status);
  //       expect(screen.getByText(label)).toBeInTheDocument();
  //     });
  //   });

  //   it('handles selection and deselection of options', async () => {
  //     const user = userEvent.setup();

  //     // Initial render with empty selection
  //     const { rerender } = render(<VitalityEthCoarseSelector />);

  //     // Test selection
  //     const institutionalButton = screen.getByText('Institutional');
  //     expect(institutionalButton).toHaveClass('selectorOption unselected');
  //     await user.click(institutionalButton);
  //     expect(updatePageParams).toHaveBeenCalledWith({
  //       vitalityEthCoarse: [VitalityEthnologueCoarse.Institutional],
  //     });

  //     // Update mock to simulate selected state and rerender
  //     vi.mocked(usePageParams).mockReturnValue(
  //       createMockUsePageParams({ vitalityEthCoarse: [VitalityEthnologueCoarse.Institutional] }),
  //     );

  //     rerender(<VitalityEthCoarseSelector />);

  //     // Test deselection
  //     const selectedInstitutional = screen.getByText('Institutional');
  //     expect(selectedInstitutional).toHaveClass('selectorOption selected');

  //     // Click to deselect
  //     await user.click(selectedInstitutional);

  //     // The mock should be called with empty array for deselection
  //     expect(updatePageParams).toHaveBeenCalledWith({
  //       vitalityEthCoarse: [],
  //     });
  //   });
  // });
});
