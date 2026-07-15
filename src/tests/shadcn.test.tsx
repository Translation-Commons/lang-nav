import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from '@shared/ui/badge';
import { Button } from '@shared/ui/button';

describe('shadcn primitives', () => {
  it('renders Button and Badge', () => {
    render(
      <>
        <Button>Click</Button>
        <Badge>New</Badge>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Click' })).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
