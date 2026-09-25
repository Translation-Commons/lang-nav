import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';
import { TerritoryScope } from '@entities/territory/TerritoryTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import IntroHeroSearch from '../IntroHeroSearch';

const indonesia = {
  type: EntityType.Territory as const,
  ID: 'ID',
  codeDisplay: 'ID',
  nameDisplay: 'Indonesia',
  names: ['Indonesia'],
  scope: TerritoryScope.Country,
  pop: { overall: 0 },
};
const indonesian = getBaseLanguageData('ind', 'Indonesian');

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(() => createMockUsePageParams()),
}));
vi.mock('@features/transforms/search/useTrackSearch', () => ({ default: () => vi.fn() }));
const { getSuggestions } = vi.hoisted(() => ({ getSuggestions: vi.fn() }));
vi.mock('@features/transforms/search/useIntroSearchSuggestions', () => ({
  default: () => getSuggestions,
}));

function LocationProbe() {
  const location = useLocation();
  return <output>{location.pathname + location.search}</output>;
}

function renderHero() {
  render(
    <MemoryRouter initialEntries={['/intro']}>
      <Routes>
        <Route path="/intro" element={<IntroHeroSearch />} />
        <Route path="/data" element={<LocationProbe />} />
        <Route path="/lucky" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('IntroHeroSearch', () => {
  beforeEach(() =>
    getSuggestions.mockResolvedValue([
      {
        entID: 'ind',
        searchString: 'Indonesian',
        label: 'Indonesian',
        ent: indonesian,
        group: 'Languages',
      },
      {
        entID: 'ID',
        searchString: 'Indonesia',
        label: 'Indonesia',
        ent: indonesia,
        group: 'Countries',
      },
    ]),
  );

  it('opens a picked language on the data page', async () => {
    renderHero();

    await userEvent.type(screen.getByRole('combobox'), 'ind');
    await userEvent.click(await screen.findByRole('option', { name: 'Indonesian ind' }));

    expect(await screen.findByRole('status')).toHaveTextContent('/data?entID=ind');
  });

  it('opens the locale table for a picked country', async () => {
    renderHero();

    await userEvent.type(screen.getByRole('combobox'), 'ind');
    await userEvent.click(await screen.findByRole('option', { name: 'Indonesia ID' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      '/data?entType=Locale&view=Table&territoryFilter=ID',
    );
  });

  it('sends the typed text to the lucky search from the Search button', async () => {
    renderHero();

    await userEvent.type(screen.getByRole('combobox'), 'ind');
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByRole('status')).toHaveTextContent('/lucky?searchString=ind');
  });

  it('keeps the Search button disabled until something is typed', async () => {
    renderHero();

    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled();
    await userEvent.type(screen.getByRole('combobox'), 'i');
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled();
  });

  it('names the search group for assistive tech', async () => {
    await act(async () => renderHero());

    expect(
      screen.getByRole('group', { name: 'Search languages and countries' }),
    ).toBeInTheDocument();
  });

  it('says the data is still loading when nothing matches yet', async () => {
    getSuggestions.mockResolvedValue([]);
    renderHero();

    await userEvent.type(screen.getByRole('combobox'), 'ind');

    expect(await screen.findByText(/Loading/)).toBeInTheDocument();
  });
});
