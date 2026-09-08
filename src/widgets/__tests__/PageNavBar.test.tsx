import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import ReportID from '@widgets/reports/ReportID';

import { EntityType, PageParams, View } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import PageNavBar from '../PageNavBar';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));
vi.mock('@features/transforms/search/SearchCombobox', () => ({
  default: () => <input aria-label="search stub" />,
}));
vi.mock('@features/feedback/FeedbackForm', () => ({ FeedbackForm: () => null }));
vi.mock('@widgets/controls/SettingsButton', () => ({ default: () => null }));

const CENSUS_VALIDATION: Partial<PageParams> = {
  entType: EntityType.Census,
  view: View.Reports,
  reportID: ReportID.CensusInputTool,
};

const DECODER_HREF = '/decoder';
const CENSUS_VALIDATION_HREF = '/data?entType=Census&view=Reports&reportID=2';

async function renderAt(path: string, params: Partial<PageParams> = {}) {
  (usePageParams as Mock).mockReturnValue(createMockUsePageParams(params));
  render(
    <MemoryRouter initialEntries={[path]}>
      <PageNavBar />
    </MemoryRouter>,
  );
  await screen.findByRole('textbox', { name: 'search stub' });
}

describe('PageNavBar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('links the brand to the intro page', async () => {
    await renderAt('/data');

    expect(screen.getByRole('link', { name: /LangNav Logo/ })).toHaveAttribute('href', '/intro');
  });

  it('marks the current page link and leaves the others plain', async () => {
    await renderAt('/about');

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Data' })).not.toHaveAttribute('aria-current');
  });

  it('opens the tools menu with links to the decoder and notable reports', async () => {
    await renderAt('/data');

    await userEvent.click(screen.getByRole('button', { name: 'Tools' }));

    expect(await screen.findByRole('menuitem', { name: 'Language Decoder' })).toHaveAttribute(
      'href',
      DECODER_HREF,
    );
    expect(screen.getByRole('menuitem', { name: 'Census Validation' })).toHaveAttribute(
      'href',
      CENSUS_VALIDATION_HREF,
    );
    expect(screen.getByRole('menuitem', { name: 'Plurals' })).toBeInTheDocument();
  });

  it('marks the tools trigger current while a tools page is open', async () => {
    await renderAt('/data', CENSUS_VALIDATION);

    expect(screen.getByRole('button', { name: 'Tools' })).toHaveAttribute('aria-current', 'page');
  });

  it('leaves the tools trigger plain on other pages', async () => {
    await renderAt('/about');

    expect(screen.getByRole('button', { name: 'Tools' })).not.toHaveAttribute('aria-current');
  });

  it('opens the search from a labelled button on narrow screens', async () => {
    await renderAt('/data');

    await userEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findAllByRole('textbox', { name: 'search stub' })).toHaveLength(2);
  });

  it('opens a menu drawer listing the pages and tools', async () => {
    await renderAt('/data');

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    const menu = within(await screen.findByRole('dialog', { name: 'Menu' }));
    expect(menu.getByRole('link', { name: 'Data' })).toHaveAttribute('href', '/data');
    expect(menu.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
    expect(menu.getByRole('link', { name: 'Language Decoder' })).toHaveAttribute(
      'href',
      DECODER_HREF,
    );
    expect(menu.getByRole('link', { name: 'Census Validation' })).toHaveAttribute(
      'href',
      CENSUS_VALIDATION_HREF,
    );
    expect(menu.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Data',
      'Language Decoder',
      'Census Validation',
      'Plurals',
      'About',
    ]);
  });

  it('closes the menu drawer after choosing a page', async () => {
    await renderAt('/data');
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const menu = within(await screen.findByRole('dialog', { name: 'Menu' }));

    await userEvent.click(menu.getByRole('link', { name: 'About' }));

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).toBeNull());
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
  });
});
