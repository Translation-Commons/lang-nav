import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';

import { View, SearchableField, PageParamsOptional } from '@features/page-params/PageParamTypes';
import usePageParams from '@features/page-params/usePageParams';

import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterPath from '../FilterPath';

// Mock hooks and components
vi.mock('@features/page-params/usePageParams', () => ({
  default: vi.fn(),
}));

vi.mock('@features/hovercard/HoverableButton', () => ({
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
  let updatePageParams: (params: PageParamsOptional) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: PageParamsOptional = {}) => {
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

  it('displays ISO status filter when selected', () => {
    setupMockParams({ isoStatus: [LanguageISOStatus.Living] });
    render(<FilterPath />);
    expect(screen.getByText(/ISO Status:/)).toBeInTheDocument();
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
    setupMockParams({ isoStatus: [LanguageISOStatus.Living] });
    render(<FilterPath />);
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ isoStatus: [] });
  });

  it('clears Ethnologue 2013 filter when X button is clicked', () => {
    setupMockParams({ vitalityEth2013: [VitalityEthnologueFine.National] });
    render(<FilterPath />);
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ vitalityEth2013: [] });
  });

  it('clears Ethnologue 2025 filter when X button is clicked', () => {
    setupMockParams({ vitalityEth2025: [VitalityEthnologueCoarse.Stable] });
    render(<FilterPath />);
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ vitalityEth2025: [] });
  });

  it('displays multiple vitality filters correctly', () => {
    setupMockParams({
      isoStatus: [LanguageISOStatus.Living],
      vitalityEth2013: [VitalityEthnologueFine.National],
      vitalityEth2025: [VitalityEthnologueCoarse.Stable],
    });
    render(<FilterPath />);
    expect(screen.getByText(/ISO Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Living/)).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue 2013:/)).toBeInTheDocument();
    expect(screen.getByText(/National/)).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue 2025:/)).toBeInTheDocument();
    expect(screen.getByText(/Stable/)).toBeInTheDocument();
  });

  it('displays multiple values within same vitality type', () => {
    setupMockParams({ isoStatus: [LanguageISOStatus.Living, LanguageISOStatus.Constructed] });
    render(<FilterPath />);
    expect(screen.getByText(/Living, Constructed/)).toBeInTheDocument();
  });

  it('does not display vitality filters in details view', () => {
    setupMockParams({ view: View.Details, isoStatus: [LanguageISOStatus.Living] });
    render(<FilterPath />);
    expect(screen.queryByText(/ISO Vitality:/)).not.toBeInTheDocument();
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
      searchBy: SearchableField.AllNames,
    });
    render(<FilterPath />);
    expect(screen.getByText(/contains/)).toBeInTheDocument();
    expect(screen.getByText(/TestSearch/)).toBeInTheDocument();
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ searchString: '' });
  });

  it('shows "Any Languoids" when the language scope filter is an empty array, meaning to allow any language-like objects to pass', () => {
    setupMockParams({ languageScopes: [] });
    render(<FilterPath />);
    expect(screen.getByText(/Any Languoid/)).toBeInTheDocument();
  });
});
