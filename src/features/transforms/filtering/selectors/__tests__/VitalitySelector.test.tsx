import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { getLanguageISOStatusLabel } from '@entities/language/vitality/VitalityStrings';
import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterSelector from '../FilterSelector';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

describe('VitalitySelector', () => {
  let updatePageParams: (params: Partial<PageParams>) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
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

  describe('LanguageISOStatusSelector', () => {
    it('displays all ISO vitality options', async () => {
      const user = userEvent.setup();
      render(<FilterSelector field={Field.ISOStatus} />);

      const expected = Object.values(LanguageISOStatus).filter((v) => typeof v === 'number');

      // If there are more than 4 options expand first so all are visible
      if (expected.length > 5) {
        await user.click(screen.getByText('Expand All'));
      }

      expected.forEach((status) => {
        const label = getLanguageISOStatusLabel(status);
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it('handles selection and deselection of options', async () => {
      const user = userEvent.setup();

      // Initial render with empty selection
      const { rerender } = render(<FilterSelector field={Field.ISOStatus} />);

      // Test selection
      const livingButton = screen.getByRole('option', { name: 'Living' });
      expect(livingButton).not.toHaveClass('bg-secondary');
      await user.click(livingButton);
      expect(updatePageParams).toHaveBeenCalledWith({ isoStatus: [LanguageISOStatus.Living] });

      // Update mock to simulate selected state and rerender
      setupMockParams({ isoStatus: [LanguageISOStatus.Living] });

      rerender(<FilterSelector field={Field.ISOStatus} />);

      // Test deselection
      const selectedLivingButton = screen.getByRole('option', { name: 'Living' });
      expect(selectedLivingButton).toHaveClass('bg-secondary');
      await user.click(selectedLivingButton);
      expect(updatePageParams).toHaveBeenCalledWith({ isoStatus: [] });
    });
  });
});
