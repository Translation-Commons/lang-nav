import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { cn } from '@shared/lib/utils';

describe('tailwind setup', () => {
  it('cn merges and dedupes classes', () => {
    expect(cn('p-2', 'p-4', 'text-sm')).toBe('p-4 text-sm');
  });

  it('className passthrough renders', () => {
    render(<div className="flex items-center" data-testid="tw" />);
    expect(screen.getByTestId('tw')).toHaveClass('flex', 'items-center');
  });
});
