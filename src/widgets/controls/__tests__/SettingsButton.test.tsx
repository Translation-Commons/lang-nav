import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import SettingsButton from '../SettingsButton';

vi.mock('@widgets/controls/Settings', () => ({ default: () => null }));

describe('SettingsButton', () => {
  it('renders a single trigger button named View settings', () => {
    render(<SettingsButton />);

    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'View settings' })).toBeInTheDocument();
  });
});
