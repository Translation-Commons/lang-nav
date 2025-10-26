import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import {
  LocaleSeparator,
  ObjectType,
  View,
  SearchableField,
} from '@features/page-params/PageParamTypes';
import { ProfileType } from '@features/page-params/Profiles';
import { usePageParams } from '@features/page-params/usePageParams';
import { SortBehavior, SortBy } from '@features/sorting/SortTypes';

import { LanguageSource } from '@entities/language/LanguageTypes';
import {
  VitalityISO,
  VitalityEthnologueCoarse,
  VitalityEthnologueFine,
} from '@entities/language/vitality/VitalityTypes';

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
  const mockUpdatePageParams = vi.fn();

  const defaultMockParams = {
    languageScopes: [],
    territoryScopes: [],
    vitalityISO: [],
    vitalityEth2013: [],
    vitalityEth2025: [],
    searchBy: SearchableField.AllNames,
    searchString: '',
    territoryFilter: '',
    languageSource: LanguageSource.All,
    objectID: undefined,
    objectType: ObjectType.Language,
    page: 1,
    profile: ProfileType.LanguageEthusiast,
    view: View.CardList,
    limit: 12,
    localeSeparator: LocaleSeparator.Underscore,
    sortBehavior: SortBehavior.Normal,
    sortBy: SortBy.Population,
    updatePageParams: mockUpdatePageParams,
  };

  beforeEach(() => {
    vi.mocked(usePageParams).mockReturnValue(defaultMockParams);
    mockUpdatePageParams.mockReset();
  });

  it('shows "No filters applied" when no filters are active', () => {
    render(<FilterPath />);
    expect(screen.getByText('No filters applied')).toBeInTheDocument();
  });

  it('displays ISO vitality filter when selected', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityISO: [VitalityISO.Living],
    });

    render(<FilterPath />);
    expect(screen.getByText(/ISO Vitality:/)).toBeInTheDocument();
    expect(screen.getByText(/Living/)).toBeInTheDocument();
  });

  it('displays Ethnologue 2013 filter when selected', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityEth2013: [VitalityEthnologueFine.National],
    });

    render(<FilterPath />);
    expect(screen.getByText(/Ethnologue 2013:/)).toBeInTheDocument();
    expect(screen.getByText(/National/)).toBeInTheDocument();
  });

  it('displays Ethnologue 2025 filter when selected', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityEth2025: [VitalityEthnologueCoarse.Stable],
    });

    render(<FilterPath />);
    expect(screen.getByText(/Ethnologue 2025:/)).toBeInTheDocument();
    expect(screen.getByText(/Stable/)).toBeInTheDocument();
  });

  it('clears ISO vitality filter when X button is clicked', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityISO: [VitalityISO.Living],
    });

    render(<FilterPath />);
    const clearButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(clearButton);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      vitalityISO: [],
    });
  });

  it('clears Ethnologue 2013 filter when X button is clicked', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityEth2013: [VitalityEthnologueFine.National],
    });

    render(<FilterPath />);
    const clearButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(clearButton);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      vitalityEth2013: [],
    });
  });

  it('clears Ethnologue 2025 filter when X button is clicked', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityEth2025: [VitalityEthnologueCoarse.Stable],
    });

    render(<FilterPath />);
    const clearButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(clearButton);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      vitalityEth2025: [],
    });
  });

  it('displays multiple vitality filters correctly', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
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
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      vitalityISO: [VitalityISO.Living, VitalityISO.Constructed],
    });

    render(<FilterPath />);
    expect(screen.getByText(/Living, Constructed/)).toBeInTheDocument();
  });

  it('does not display vitality filters in details view', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      view: View.Details,
      vitalityISO: [VitalityISO.Living],
    });

    render(<FilterPath />);
    expect(screen.queryByText(/ISO Vitality:/)).not.toBeInTheDocument();
  });

  it('displays and clears territory filter', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      territoryFilter: 'TestTerritory',
    });

    render(<FilterPath />);
    expect(screen.getByText(/TestTerritory/)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(clearButton);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      territoryFilter: '',
    });
  });

  it('displays and clears search string with field', () => {
    vi.mocked(usePageParams).mockReturnValue({
      ...defaultMockParams,
      searchString: 'TestSearch',
      searchBy: SearchableField.AllNames,
    });

    render(<FilterPath />);
    expect(screen.getByText(/contains/)).toBeInTheDocument();
    expect(screen.getByText(/TestSearch/)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(clearButton);

    expect(mockUpdatePageParams).toHaveBeenCalledWith({
      searchString: '',
    });
  });
});
