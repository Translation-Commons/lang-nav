import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Selector from '../Selector';
import { SelectorDisplay, SelectorDisplayProvider } from '../SelectorDisplayContext';

vi.mock('@shared/hooks/useClickOutside', () => ({ useClickOutside: () => React.createRef() }));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));

describe('Selector component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a label when selectorLabel is provided', () => {
    render(
      <Selector
        options={['one', 'two']}
        selected={'one'}
        onChange={() => {}}
        selectorLabel="My Label"
        selectorDescription="desc"
      />,
    );

    expect(screen.getByText('My Label')).toBeTruthy();
  });

  it('toggles dropdown when standalone option is clicked and calls onChange for options inside dropdown', () => {
    const handleChange = vi.fn();
    render(
      <SelectorDisplayProvider display={SelectorDisplay.Dropdown}>
        <Selector options={['one', 'two']} selected={'one'} onChange={handleChange} />
      </SelectorDisplayProvider>,
    );

    // Initially dropdown should not be rendered
    expect(screen.queryByText('two')).toBeNull();

    // The standalone option shows the selected with the arrow to open
    const standalone = screen.getByText('one ▶');
    expect(standalone).toBeTruthy();

    // Open dropdown
    fireEvent.click(standalone);
    const dropdown = screen.queryByRole('listbox');
    expect(dropdown).toBeTruthy();

    // Within the dropdown, option-two should be present
    const optionTwo = within(dropdown!).getByText('two');
    fireEvent.click(optionTwo);

    // onChange should have been called with 'two' and dropdown should close
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('two');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
