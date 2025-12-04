import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import TextInput from '../TextInput';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams({})),
}));
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: () => ({ showHoverCard: vi.fn(), hideHoverCard: vi.fn() }),
}));
vi.mock('lucide-react', () => ({ XIcon: () => 'X' }));

describe('TextInput component', () => {
  const createUser = () => userEvent.setup();
  const flushTimers = async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', async () => {
    const user = createUser();
    const onSubmit = vi.fn();
    const result = render(<TextInput onSubmit={onSubmit} value="" />);

    // Write to input component
    const input = result.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('');
    await user.click(input);
    await user.type(input, 'test input');
    expect(input.value).toBe('test input');

    // Submit input
    await user.keyboard('{Enter}');
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('test input'));
  });

  it('shows suggestions and handles suggestion submit events', async () => {
    const user = createUser();
    const onSubmit = vi.fn();
    const getSuggestions = async (query: string) =>
      query === 'no match'
        ? []
        : [
            { searchString: 'apple', label: 'Apple' },
            { searchString: 'banana', label: 'Banana' },
            { searchString: 'cherry', label: 'Cherry' },
          ];

    const result = render(
      <TextInput onSubmit={onSubmit} getSuggestions={getSuggestions} value="" />,
    );
    // Ensure no suggestions initially
    expect(result.queryByRole('listbox')).toBeNull();

    // Focus input to trigger suggestions
    const input = result.getByRole('combobox') as HTMLInputElement;
    await user.click(input);

    // Wait for suggestions to appear
    const suggestionList = await result.findByRole('listbox');
    expect(suggestionList).toBeTruthy();

    // Click on a suggestion
    const bananaOption = await result.findByText('Banana');
    await user.click(bananaOption);
    await flushTimers();

    // Ensure onSubmit is called with suggestion value
    expect(onSubmit).toHaveBeenCalledWith('banana');

    // If an input does not have suggestions, the listbox should not appear
    await user.click(input);
    await user.clear(input);
    await user.type(input, 'no match');
    await flushTimers();
    await waitFor(() => expect(result.queryByRole('listbox')).toBeNull());
  });

  it('handles keydown events', async () => {
    const user = createUser();
    const onSubmit = vi.fn();
    const getSuggestions = async (query: string) =>
      query.length > 0 ? [{ searchString: 'apple', label: 'Apple' }] : [];

    const result = render(
      <TextInput onSubmit={onSubmit} getSuggestions={getSuggestions} value="" />,
    );
    const input = result.getByRole('combobox') as HTMLInputElement;

    // Test typing in input
    await user.click(input);
    await user.type(input, 'app');
    expect(input.value).toBe('app');
    const suggestionList = await result.findByRole('listbox');
    expect(suggestionList).toBeTruthy();

    // Test Escape key reverts input and hides suggestions
    await user.keyboard('{Escape}');
    expect(input.value).toBe('');
    await waitFor(() => expect(result.queryByRole('listbox')).toBeNull());

    // Test Enter key submits input
    await user.type(input, 'another test');
    await user.keyboard('{Enter}');
    await flushTimers();
    expect(onSubmit).toHaveBeenCalledWith('another test');
  });

  it('test that clicking outside hides suggestions', async () => {
    const user = createUser();
    const onSubmit = vi.fn();
    const getSuggestions = async (query: string) =>
      query.length > 0 ? [{ searchString: 'apple', label: 'Apple' }] : [];

    const result = render(
      <div>
        <TextInput onSubmit={onSubmit} getSuggestions={getSuggestions} value="" />
        <button type="button">Outside Button</button>
      </div>,
    );
    const input = result.getByRole('combobox') as HTMLInputElement;

    // Type to get suggestions
    await user.click(input);
    await user.type(input, 'app');
    expect(input.value).toBe('app');
    const suggestionList = await result.findByRole('listbox');
    expect(suggestionList).toBeTruthy();

    // Click outside to hide suggestions
    const outsideButton = result.getByText('Outside Button');
    await user.click(outsideButton);
    await flushTimers();

    // Ensure suggestions are hidden
    await waitFor(() => expect(result.queryByRole('listbox')).toBeNull());
  });

  it('test that escape reverts to the original state rather than clearing it', async () => {
    const user = createUser();
    const onSubmit = vi.fn();

    const result = render(<TextInput onSubmit={onSubmit} value="original" />);
    const input = result.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('original');

    // Modify the input value
    await user.click(input);
    await user.clear(input);
    await user.type(input, 'modified');
    expect(input.value).toBe('modified');

    // Press Escape to revert changes
    await user.keyboard('{Escape}');
    expect(input.value).toBe('original');
  });

  it('test that clear removes input value and suggestions', async () => {
    const user = createUser();
    const getSuggestions = async () => [
      { searchString: 'apple', label: 'Apple' },
      { searchString: 'banana', label: 'Banana' },
    ];

    const MutableTextInput: React.FC = () => {
      const [val, setVal] = React.useState('app');
      const onSubmit = (newValue: string) => setVal(newValue);
      return <TextInput onSubmit={onSubmit} getSuggestions={getSuggestions} value={val} />;
    };

    // Render the controlled wrapper so value updates flow into the component
    const result = render(<MutableTextInput />);
    const input = result.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('app');
    expect(result.queryByRole('listbox')).toBeNull(); // no suggestions

    // Type to get suggestions
    await user.click(input);
    await user.type(input, 'l');
    expect(input.value).toBe('appl');
    await result.findByRole('listbox'); // suggestions appear

    // Click clear button
    const clearButton = await result.findByText('X');
    await user.click(clearButton);
    await flushTimers();

    // Ensure onSubmit was called by the consequences -- input is cleared and suggestions are gone
    await waitFor(() => expect(input.value).toBe(''));
    await waitFor(() => expect(result.queryByRole('listbox')).toBeNull());
  });
});
