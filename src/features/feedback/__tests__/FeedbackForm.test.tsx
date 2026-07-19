import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeedbackForm } from '../FeedbackForm';

describe('FeedbackForm popover', () => {
  it('stays open through form interaction and closes only on explicit dismissal', async () => {
    render(<FeedbackForm />);

    fireEvent.click(screen.getByRole('button', { name: 'Feedback' }));
    const popup = await screen.findByRole('dialog', { name: 'Shape the future of LangNav' });

    const textarea = screen.getByPlaceholderText('What did you notice or suggest?');
    fireEvent.change(textarea, { target: { value: 'The map is great' } });
    expect(popup).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Data issue' } });
    expect(popup).toBeInTheDocument();

    const mailto = screen.getByRole('link', { name: /Open email/ });
    expect(mailto.getAttribute('href')).toContain('mailto:');
    expect(mailto.getAttribute('href')).toContain(encodeURIComponent('Data issue'));
    fireEvent.click(mailto);
    expect(screen.getByRole('dialog', { name: 'Shape the future of LangNav' })).toBeInTheDocument();

    fireEvent.keyDown(popup, { key: 'Escape' });
    expect(
      screen.queryByRole('dialog', { name: 'Shape the future of LangNav' }),
    ).not.toBeInTheDocument();
  });
});
