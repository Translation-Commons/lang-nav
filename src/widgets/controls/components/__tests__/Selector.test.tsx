import { render, fireEvent, screen, within } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import Selector from '../Selector';
import { SelectorDisplay } from '../SelectorDisplay';

vi.mock('@shared/hooks/useClickOutside', () => ({ useClickOutside: () => React.createRef() }));
vi.mock('@features/hovercard/useHoverCard', () => ({
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

  it('renders all options in ButtonList (default) display', () => {
    render(
      <Selector
        options={['a', 'b']}
        selected={'a'}
        onChange={() => {}}
        getOptionLabel={(str) => `option-${str}`}
      />,
    );

    expect(screen.getByText('option-a')).toBeTruthy();
    expect(screen.getByText('option-b')).toBeTruthy();

    // The selected option should have data-selected true
    expect(screen.getByText('option-a').getAttribute('class')).toBe('selectorOption selected');
    expect(screen.getByText('option-b').getAttribute('class')).toBe('selectorOption unselected');
  });

  it('toggles dropdown when standalone option is clicked and calls onChange for options inside dropdown', () => {
    const handleChange = vi.fn();
    render(
      <Selector
        display={SelectorDisplay.Dropdown}
        options={['one', 'two']}
        selected={'one'}
        onChange={handleChange}
      />,
    );

    // Initially dropdown should not be rendered
    expect(screen.queryByText('two')).toBeNull();

    // The standalone option shows the selected with the arrow to open
    const standalone = screen.getByText('one ▶');
    expect(standalone).toBeTruthy();

    // Open dropdown
    fireEvent.click(standalone);
    const dropdown = screen.queryByTestId('dropdown');
    expect(dropdown).toBeTruthy();

    // Within the dropdown, option-two should be present
    const optionTwo = within(dropdown!).getByText('two');
    fireEvent.click(optionTwo);

    // onChange should have been called with 'two' and dropdown should close
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('two');
    expect(screen.queryByTestId('dropdown')).toBeNull();
  });

  it('supports multiple selection state (selected as array) and marks appropriate options', () => {
    render(
      <Selector
        options={['x', 'y', 'z']}
        selected={['x', 'z']}
        onChange={() => {}}
        display={SelectorDisplay.ButtonList}
      />,
    );

    expect(screen.getByText('x').getAttribute('class')).toBe('selectorOption selected');
    expect(screen.getByText('y').getAttribute('class')).toBe('selectorOption unselected');
    expect(screen.getByText('z').getAttribute('class')).toBe('selectorOption selected');
  });
});
