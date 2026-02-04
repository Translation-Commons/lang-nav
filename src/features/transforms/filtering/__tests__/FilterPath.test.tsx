import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { PageParamsOptional, SearchableField } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import {
  LanguageISOStatus,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

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

  it('displays Ethnologue fine vitality filter when selected', () => {
    setupMockParams({ vitalityEthFine: [VitalityEthnologueFine.National] });
    render(<FilterPath />);
    expect(screen.getByText(/Ethnologue Fine:/)).toBeInTheDocument();
    expect(screen.getByText(/National/)).toBeInTheDocument();
  });

  it('displays Ethnologue coarse filter when selected', () => {
    setupMockParams({ vitalityEthCoarse: [VitalityEthnologueCoarse.Stable] });
    render(<FilterPath />);
    expect(screen.getByText(/Ethnologue Coarse:/)).toBeInTheDocument();
    expect(screen.getByText(/Stable/)).toBeInTheDocument();
  });

  it('clears ISO vitality filter when X button is clicked', () => {
    setupMockParams({ isoStatus: [LanguageISOStatus.Living] });
    render(<FilterPath />);
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ isoStatus: [] });
  });

  it('clears Ethnologue fine vitality filter when X button is clicked', () => {
    setupMockParams({ vitalityEthFine: [VitalityEthnologueFine.National] });
    render(<FilterPath />);
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ vitalityEthFine: [] });
  });

  it('clears Ethnologue coarse filter when X button is clicked', () => {
    setupMockParams({ vitalityEthCoarse: [VitalityEthnologueCoarse.Stable] });
    render(<FilterPath />);
    clickClearButton();
    expect(updatePageParams).toHaveBeenCalledWith({ vitalityEthCoarse: [] });
  });

  it('displays multiple vitality filters correctly', () => {
    setupMockParams({
      isoStatus: [LanguageISOStatus.Living],
      vitalityEthFine: [VitalityEthnologueFine.National],
      vitalityEthCoarse: [VitalityEthnologueCoarse.Stable],
    });
    render(<FilterPath />);
    expect(screen.getByText(/ISO Status:/)).toBeInTheDocument();
    expect(screen.getByText(/Living/)).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue Fine:/)).toBeInTheDocument();
    expect(screen.getByText(/National/)).toBeInTheDocument();
    expect(screen.getByText(/Ethnologue Coarse:/)).toBeInTheDocument();
    expect(screen.getByText(/Stable/)).toBeInTheDocument();
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

  it('shows "Any Languoids" when the language scope filter is an empty array, meaning to allow any language-like objects to pass', () => {
    setupMockParams({ languageScopes: [] });
    render(<FilterPath />);
    expect(screen.getByText(/Any Languoid/)).toBeInTheDocument();
  });
});
