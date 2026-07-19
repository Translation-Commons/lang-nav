import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ObjectiveList } from '@widgets/CommonObjectives';

function rowFor(labelText: string): HTMLElement {
  const row = screen.getByText(labelText).closest('form');
  if (!row) throw new Error(`No row for ${labelText}`);
  return row;
}

describe('CommonObjectives navigation', () => {
  let assignedHref: string | undefined;

  beforeEach(() => {
    assignedHref = undefined;
    vi.stubGlobal('location', {
      get href() {
        return assignedHref ?? '';
      },
      set href(value: string) {
        assignedHref = value;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navigates with the configured urlParams when GO is pressed', () => {
    render(<ObjectiveList />);
    const row = rowFor('Explore language families.');
    fireEvent.click(within(row).getByRole('button', { name: 'GO' }));

    expect(assignedHref).toContain('data?');
    expect(assignedHref).toContain('view=Hierarchy');
  });

  it('flows the input value into the search param before navigating', () => {
    render(<ObjectiveList />);
    const row = rowFor('Find information about a language.');
    const input = within(row).getByPlaceholderText('Enter a language name');
    fireEvent.change(input, { target: { value: 'spanish' } });
    fireEvent.click(within(row).getByRole('button', { name: 'GO' }));

    expect(assignedHref).toContain('lucky?');
    expect(assignedHref).toContain('searchString=spanish');
  });

  it('submits on Enter within the input', () => {
    render(<ObjectiveList />);
    const row = rowFor('See the languages in a country.');
    const input = within(row).getByPlaceholderText('Enter a country');
    fireEvent.change(input, { target: { value: 'France' } });
    fireEvent.submit(within(row).getByRole('button', { name: 'GO' }).closest('form')!);

    expect(assignedHref).toContain('territoryFilter=France');
    expect(assignedHref).toContain('view=Table');
  });
});
