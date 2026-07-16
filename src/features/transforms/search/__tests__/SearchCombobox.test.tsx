import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { Suggestion } from '@features/params/ui/SelectorSuggestions';

import SearchCombobox from '../SearchCombobox';

const SUGGESTIONS: Suggestion[] = [
  { objectID: 'cmn', searchString: 'Chinese', label: 'Chinese', group: 'matched' },
  { objectID: 'chp', searchString: 'Chipewyan', label: 'Chipewyan', group: 'matched' },
];

const getSuggestions = vi.fn(async (query: string) =>
  query === ''
    ? SUGGESTIONS
    : SUGGESTIONS.filter((s) => s.searchString.toLowerCase().includes(query.toLowerCase())),
);

const LocationDisplay: React.FC = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

function renderCombobox(overrides: Partial<React.ComponentProps<typeof SearchCombobox>> = {}) {
  const onSubmit = vi.fn();
  render(
    <MemoryRouter initialEntries={['/data']}>
      <SearchCombobox
        getSuggestions={getSuggestions}
        onSubmit={onSubmit}
        placeholder="search"
        value=""
        {...overrides}
      />
      <LocationDisplay />
    </MemoryRouter>,
  );
  return { onSubmit, user: userEvent.setup() };
}

describe('SearchCombobox', () => {
  it('shows suggestions when typing and marks the combobox expanded', async () => {
    const { user } = renderCombobox();
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'chi');

    await waitFor(() => expect(screen.getByText('Chinese')).toBeInTheDocument());
    expect(screen.getByText('Chipewyan')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', 'suggestion-list');
  });

  it('commits the param and navigates when a suggestion is selected', async () => {
    const { onSubmit, user } = renderCombobox();
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'chin');
    await waitFor(() => expect(screen.getByText('Chinese')).toBeInTheDocument());

    await user.click(screen.getByText('Chinese'));

    expect(onSubmit).toHaveBeenCalledWith('Chinese', 'suggestion');
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toContain('objectID=cmn'),
    );
    expect(screen.getByTestId('location').textContent).toContain('searchString=Chinese');
  });

  it('submits the typed query on Enter', async () => {
    const { onSubmit, user } = renderCombobox();
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'chin');
    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('chin', 'input');
  });

  it('reverts to the prior value on Escape and closes the panel', async () => {
    const { user } = renderCombobox({ value: 'orig' });
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('orig');

    await user.click(input);
    await user.type(input, 'X');
    expect(input).toHaveValue('origX');

    await user.keyboard('{Escape}');
    expect(input).toHaveValue('orig');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('clears the field and refocuses the input when the clear button is clicked', async () => {
    const { onSubmit, user } = renderCombobox({ value: 'chinese' });
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('chinese');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(onSubmit).toHaveBeenCalledWith('', 'clear');
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
  });

  it('does not render the clear button when the field is empty', () => {
    renderCombobox({ value: '' });
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });
});
