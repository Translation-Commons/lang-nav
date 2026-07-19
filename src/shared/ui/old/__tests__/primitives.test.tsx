import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ExternalLink from '@shared/ui/old/ExternalLink';
import LinkButton from '@shared/ui/old/LinkButton';
import Pill from '@shared/ui/old/Pill';

describe('legacy primitive APIs', () => {
  it('LinkButton renders an external anchor with its children', () => {
    render(<LinkButton href="https://example.com">Docs</LinkButton>);
    const link = screen.getByRole('link', { name: /Docs/ });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('ExternalLink with no children shows the href as text', () => {
    render(<ExternalLink href="https://example.com" />);
    expect(screen.getByRole('link')).toHaveTextContent('https://example.com');
  });

  it('Pill renders children and accepts a style override', () => {
    render(<Pill style={{ opacity: 0.5 }}>beta</Pill>);
    expect(screen.getByText('beta')).toBeInTheDocument();
  });
});
