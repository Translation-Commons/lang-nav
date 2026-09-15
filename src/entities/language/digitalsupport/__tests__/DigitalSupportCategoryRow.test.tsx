import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import DigitalSupportCategoryRow from '../DigitalSupportCategoryRow';
import { DigitalSupportStatus } from '../DigitalSupportTypes';

function renderRow(status = DigitalSupportStatus.Partial, label = '1 of 4 platforms') {
  return render(
    <ul>
      <DigitalSupportCategoryRow summary={{ status, label }} title="Interfaces">
        <div>MacOS language pack</div>
      </DigitalSupportCategoryRow>
    </ul>,
  );
}

describe('DigitalSupportCategoryRow', () => {
  it('starts collapsed and hides the evidence', () => {
    renderRow();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('MacOS language pack')).toBeNull();
  });

  it('names the status in text as well as with an icon, not just color', () => {
    renderRow(DigitalSupportStatus.NotSupported, 'Not supported');
    expect(
      screen.getByRole('button', { name: /not supported.*interfaces.*not supported/i }),
    ).toBeTruthy();
  });

  it('reveals the evidence when clicked', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('MacOS language pack')).toBeTruthy();

    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('can be toggled from the keyboard', async () => {
    const user = userEvent.setup();
    renderRow();

    await user.tab();
    expect(screen.getByRole('button')).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard(' ');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('points aria-controls at the container holding the evidence', async () => {
    const user = userEvent.setup();
    const { container } = renderRow();

    await user.click(screen.getByRole('button'));
    const contentId = screen.getByRole('button').getAttribute('aria-controls');
    expect(container.querySelector(`#${CSS.escape(contentId ?? '')}`)?.textContent).toBe(
      'MacOS language pack',
    );
  });
});
