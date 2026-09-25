import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FeedbackForm } from '../FeedbackForm';

describe('FeedbackForm', () => {
  it('renders a single trigger button named Feedback', () => {
    render(<FeedbackForm />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Feedback' })).toBeInTheDocument();
  });
});
