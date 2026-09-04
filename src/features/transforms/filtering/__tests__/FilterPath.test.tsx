import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParams, SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { LanguageISOStatus } from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterPath from '../FilterPath';

// Mock hooks and components
vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(),
}));

vi.mock('@features/layers/hovercard/HoverableButton', () => ({
  default: ({
    children,
    onClick,
    buttonType,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    buttonType?: string;
  }) => (
    <button type="button" onClick={onClick} aria-label={buttonType}>
      {children}
    </button>
  ),
}));

describe('FilterPath', () => {
  let updatePageParams: (params: Partial<PageParams>) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  // Helper function to eliminate clear button interaction duplication
  const clickClearButton = () => {
    const clearButton = screen.getByRole('button', { name: 'reset' });
    fireEvent.click(clearButton);
  };

  beforeEach(() => {
    setupMockParams();
  });

  it('shows "No filters applied" when no filters are active', () => {
    render(<FilterPath />);
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
  });

  it('displays multiple values within same vitality type', () => {
    setupMockParams({ isoStatus: [LanguageISOStatus.Living, LanguageISOStatus.Constructed] });
    render(<FilterPath />);
    expect(screen.getByText(/Living, Constructed/)).toBeInTheDocument();
  });

  it('displays and clears territory filter', () => {
    setupMockParams({ territoryFilter: 'TestTerritory' });
    render(<FilterPath />);
    expect(screen.getByText(/TestTerritory/)).toBeInTheDocument();
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ territoryFilter: '' });
  });

  it('displays and clears search string with field', () => {
    setupMockParams({
      searchString: 'TestSearch',
      searchBy: SearchableField.NameAny,
    });
    render(<FilterPath />);
    expect(screen.getByText(/contains/)).toBeInTheDocument();
    expect(screen.getByText(/TestSearch/)).toBeInTheDocument();
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ searchString: '' });
  });
});
