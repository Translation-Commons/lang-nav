import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Selector from '../Selector';
import { SelectorDisplay, SelectorDisplayProvider } from '../SelectorDisplayContext';

describe('Selector modes', () => {
  it('dropdown: picking an option calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Selector
        display={SelectorDisplay.Dropdown}
        options={['Cards', 'Table', 'Map']}
        selected="Cards"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Table' }));
    expect(onChange).toHaveBeenCalledWith('Table');
  });

  it('inline dropdown: also renders a combobox trigger', () => {
    render(
      <Selector
        display={SelectorDisplay.InlineDropdown}
        options={['one', 'two']}
        selected="one"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('button group: clicking a toggle calls onChange with the option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Selector
        display={SelectorDisplay.ButtonGroup}
        options={['A', 'B']}
        selected="A"
        onChange={onChange}
      />,
    );
    const optionB = screen.getByRole('button', { name: 'B' });
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(optionB);
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('button list: renders every option and clicking calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Selector
        options={['a', 'b']}
        selected="a"
        onChange={onChange}
        getOptionLabel={(str) => `option-${str}`}
        display={SelectorDisplay.ButtonList}
      />,
    );
    expect(screen.getByRole('button', { name: 'option-a' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'option-b' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('button list: marks every selected value from an array', () => {
    render(
      <Selector
        options={['x', 'y', 'z']}
        selected={['x', 'z']}
        onChange={vi.fn()}
        display={SelectorDisplay.ButtonList}
      />,
    );
    expect(screen.getByRole('button', { name: 'x' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'y' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'z' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('filter list: collapses to 4 options with an Expand All button', () => {
    render(
      <Selector
        display={SelectorDisplay.FilterList}
        options={['1', '2', '3', '4', '5', '6', '7']}
        selected="1"
        onChange={vi.fn()}
      />,
    );
    expect(screen.getAllByRole('button').length).toBeLessThan(8);
    expect(screen.getByRole('button', { name: /Expand All/ })).toBeInTheDocument();
  });

  it('filter list: expanding reveals all options and clicking calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Selector
        display={SelectorDisplay.FilterList}
        options={['1', '2', '3', '4', '5', '6', '7']}
        selected="1"
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole('button', { name: /Expand All/ }));
    await user.click(screen.getByRole('button', { name: '7' }));
    expect(onChange).toHaveBeenCalledWith('7');
    expect(screen.getByRole('button', { name: /Collapse/ })).toBeInTheDocument();
  });

  it('renders a selector label when provided', () => {
    render(
      <SelectorDisplayProvider display={SelectorDisplay.ButtonList}>
        <Selector
          options={['one', 'two']}
          selected="one"
          onChange={vi.fn()}
          selectorLabel="My Label"
          selectorDescription="desc"
        />
      </SelectorDisplayProvider>,
    );
    expect(screen.getByText('My Label')).toBeInTheDocument();
  });

  it('dropdown: shows labelWhenEmpty when a multi-select value is empty', () => {
    render(
      <Selector
        display={SelectorDisplay.Dropdown}
        options={['a', 'b']}
        selected={[]}
        onChange={vi.fn()}
        labelWhenEmpty="Any"
      />,
    );
    expect(within(screen.getByRole('combobox')).getByText('Any')).toBeInTheDocument();
  });
});
