import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { View, SearchableField, PageParamsOptional } from '@features/page-params/PageParamTypes';
import { usePageParams } from '@features/page-params/usePageParams';

import {
  VitalityISO,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockObjects';

import FilterPath from './FilterPath';

// Mock hooks and components
vi.mock('@features/page-params/usePageParams', () => ({
  usePageParams: vi.fn(),
}));

vi.mock('@shared/ui/HoverableButton', () => ({
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
  let mockUsePageParams: ReturnType<typeof createMockUsePageParams>;
  let mockUpdatePageParams: ReturnType<typeof vi.fn>;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: PageParamsOptional = {}) => {
    mockUsePageParams = createMockUsePageParams(overrides);
    mockUsePageParams.updatePageParams = mockUpdatePageParams;
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
  };

  // Helper function to eliminate clear button interaction duplication
  const clickClearButton = () => {
    const clearButton = screen.getByRole('button', { name: 'reset' });
    fireEvent.click(clearButton);
  };

  beforeEach(() => {
    mockUpdatePageParams = vi.fn();
    setupMockParams();
    mockUpdatePageParams.mockReset();
  });

  it('shows "No filters applied" when no filters are active', () => {
    render(<FilterPath />);
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
  });

  it('displays ISO vitality filter when selected', () => {
    setupMockParams({ vitalityISO: [VitalityISO.Living] });
    render(<FilterPath />);
    expect(screen.getByText(/ISO Vitality:/)).toBeInTheDocument();
    expect(screen.getByText(/Living/)).toBeInTheDocument();
  });

  it('displays Ethnologue 2013 filter when selected', () => {
    setupMockParams({ vitalityEth2013: [VitalityEthnologueFine.National] });
    render(<FilterPath />);
    expect(screen.getByText(/Ethnologue 2013:/)).toBeInTheDocument();
    expect(screen.getByText(/National/)).toBeInTheDocument();
  });

  it('displays Ethnologue 2025 filter when selected', () => {
    setupMockParams({ vitalityEth2025: [VitalityEthnologueCoarse.Stable] });
    render(<FilterPath />);
    expect(screen.getByText(/Ethnologue 2025:/)).toBeInTheDocument();
    expect(screen.getByText(/Stable/)).toBeInTheDocument();
  });

  it('clears ISO vitality filter when X button is clicked', () => {
    setupMockParams({ vitalityISO: [VitalityISO.Living] });
    render(<FilterPath />);
    clickClearButton();
    expect(mockUpdatePageParams).toHaveBeenCalledWith({ vitalityISO: [] });
  });

  it('clears Ethnologue 2013 filter when X button is clicked', () => {
    setupMockParams({ vitalityEth2013: [VitalityEthnologueFine.National] });
    render(<FilterPath />);
    clickClearButton();
    expect(mockUpdatePageParams).toHaveBeenCalledWith({ vitalityEth2013: [] });
  });

  it('clears Ethnologue 2025 filter when X button is clicked', () => {
    setupMockParams({ vitalityEth2025: [VitalityEthnologueCoarse.Stable] });
    render(<FilterPath />);
    clickClearButton();
    expect(mockUpdatePageParams).toHaveBeenCalledWith({ vitalityEth2025: [] });
  });

  it('displays multiple vitality filters correctly', () => {
    setupMockParams({
      vitalityISO: [VitalityISO.Living],
      vitalityEth2013: [VitalityEthnologueFine.National],
      vitalityEth2025: [VitalityEthnologueCoarse.Stable],
    });
    render(<FilterPath />);
    expect(screen.getByText(/ISO Vitality:/)).toBeInTheDocument();
    expect(screen.getByText(/Living/)).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue 2013:/)).toBeInTheDocument();
    expect(screen.getByText(/National/)).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue 2025:/)).toBeInTheDocument();
    expect(screen.getByText(/Stable/)).toBeInTheDocument();
  });

  it('displays multiple values within same vitality type', () => {
    setupMockParams({ vitalityISO: [VitalityISO.Living, VitalityISO.Constructed] });
    render(<FilterPath />);
    expect(screen.getByText(/Living, Constructed/)).toBeInTheDocument();
  });

  it('does not display vitality filters in details view', () => {
    setupMockParams({ view: View.Details, vitalityISO: [VitalityISO.Living] });
    render(<FilterPath />);
    expect(screen.queryByText(/ISO Vitality:/)).not.toBeInTheDocument();
  });

  it('displays and clears territory filter', () => {
    setupMockParams({ territoryFilter: 'TestTerritory' });
    render(<FilterPath />);
    expect(screen.getByText(/TestTerritory/)).toBeInTheDocument();
    clickClearButton();
    expect(mockUpdatePageParams).toHaveBeenCalledWith({ territoryFilter: '' });
  });

  it('displays and clears search string with field', () => {
    setupMockParams({
      searchString: 'TestSearch',
      searchBy: SearchableField.AllNames,
    });
    render(<FilterPath />);
    expect(screen.getByText(/contains/)).toBeInTheDocument();
    expect(screen.getByText(/TestSearch/)).toBeInTheDocument();
    clickClearButton();
    expect(mockUpdatePageParams).toHaveBeenCalledWith({ searchString: '' });
  });
});
