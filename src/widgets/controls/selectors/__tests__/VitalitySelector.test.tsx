import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, afterEach, vi, Mock } from 'vitest';

import { PageParamsOptional } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

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

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import {
  VitalityISOSelector,
  VitalityEth2013Selector,
  VitalityEth2025Selector,
} from '../VitalitySelector';

vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/hovercard/useHoverCard', () => ({ default: vi.fn().mockReturnValue({}) }));

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
        <VitalityISOSelector />
        <VitalityEth2013Selector />
        <VitalityEth2025Selector />
      </>,
    );

    expect(screen.getByText('ISO Language Status')).toBeInTheDocument();
    expect(screen.getByText('Ethnologue 2013 Status')).toBeInTheDocument();
    expect(screen.getByText('Ethnologue 2025 Status')).toBeInTheDocument();
  });

  describe('VitalityISOSelector', () => {
    it('displays all ISO vitality options', () => {
      render(<VitalityISOSelector />);
      const expected = Object.values(VitalityISO).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getVitalityISOLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(<VitalityISOSelector />);

      // Test selection
      const livingButton = screen.getByRole('button', { name: 'Living' });
      expect(livingButton).toHaveClass('selectorOption unselected');
      await user.click(livingButton);
      expect(updatePageParams).toHaveBeenCalledWith({ vitalityISO: [VitalityISO.Living] });

      // Update mock to simulate selected state and rerender
      setupMockParams({ vitalityISO: [VitalityISO.Living] });

      rerender(<VitalityISOSelector />);

      // Test deselection
      const selectedLivingButton = screen.getByRole('button', { name: 'Living' });
      expect(selectedLivingButton).toHaveClass('selectorOption selected');
      await user.click(selectedLivingButton);
      expect(updatePageParams).toHaveBeenCalledWith({ vitalityISO: [] });
    });
  });

  describe('VitalityEth2013Selector', () => {
    it('displays all Ethnologue 2013 vitality options', () => {
      render(<VitalityEth2013Selector />);

      const expected = Object.values(VitalityEthnologueFine).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getVitalityEthnologueFineLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(<VitalityEth2013Selector />);

      // Test selection
      const nationalButton = screen.getByRole('button', { name: 'National' });
      expect(nationalButton).toHaveClass('selectorOption unselected');
      await user.click(nationalButton);
      expect(updatePageParams).toHaveBeenCalledWith({
        vitalityEth2013: [VitalityEthnologueFine.National],
      });

      // Update mock to simulate selected state and rerender
      setupMockParams({ vitalityEth2013: [VitalityEthnologueFine.National] });

      rerender(<VitalityEth2013Selector />);

      // Test deselection
      const selectedNational = screen.getByRole('button', { name: 'National' });
      expect(selectedNational).toHaveClass('selectorOption selected');

      // Click to deselect
      await user.click(selectedNational);

      // Verify the expected state after deselection
      expect(updatePageParams).toHaveBeenCalledWith({
        vitalityEth2013: [],
      });
    });
  });

  describe('VitalityEth2025Selector', () => {
    it('displays all Ethnologue 2025 vitality options', () => {
      render(<VitalityEth2025Selector />);

      const expected = Object.values(VitalityEthnologueCoarse).filter((v) => typeof v === 'number');

      expected.forEach((status) => {
        const label = getVitalityEthnologueCoarseLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(<VitalityEth2025Selector />);

      // Test selection
      const institutionalButton = screen.getByRole('button', { name: 'Institutional' });
      expect(institutionalButton).toHaveClass('selectorOption unselected');
      await user.click(institutionalButton);
      expect(updatePageParams).toHaveBeenCalledWith({
        vitalityEth2025: [VitalityEthnologueCoarse.Institutional],
      });

      // Update mock to simulate selected state and rerender
      vi.mocked(usePageParams).mockReturnValue(
        createMockUsePageParams({ vitalityEth2025: [VitalityEthnologueCoarse.Institutional] }),
      );

      rerender(<VitalityEth2025Selector />);

      // Test deselection
      const selectedInstitutional = screen.getByRole('button', { name: 'Institutional' });
      expect(selectedInstitutional).toHaveClass('selectorOption selected');

      // Click to deselect
      await user.click(selectedInstitutional);

      // The mock should be called with empty array for deselection
      expect(updatePageParams).toHaveBeenCalledWith({
        vitalityEth2025: [],
      });
    });
  });
});
