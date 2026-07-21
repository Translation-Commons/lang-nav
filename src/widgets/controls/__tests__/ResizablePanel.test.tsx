import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import FilterPanelProvider from '../FilterPanelProvider';
import ResizablePanel from '../ResizablePanel';

// FilterPanelProvider reads objectID to auto-close the filter panel; the value is irrelevant here.
vi.mock('@features/params/usePageParams', () => ({
  default: () => ({ objectID: undefined }),
}));

function mockViewport(isDesktop: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width') ? isDesktop : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function renderPanel() {
  return render(
    <FilterPanelProvider>
      <ResizablePanel
        purpose="filters"
        defaultWidth={300}
        title={<strong>Filters</strong>}
        isOpen
        onClose={() => {}}
      >
        <div>panel body content</div>
      </ResizablePanel>
    </FilterPanelProvider>,
  );
}

describe('ResizablePanel responsive rendering', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('renders an inline aside (not a drawer) at desktop width', () => {
    mockViewport(true);
    const { container } = renderPanel();

    expect(container.querySelector('aside')).toBeInTheDocument();
    expect(screen.getByText('panel body content')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="drawer-popup"]')).not.toBeInTheDocument();
  });

  it('renders a drawer overlay (not an inline aside) at mobile width', () => {
    mockViewport(false);
    const { container } = renderPanel();

    expect(container.querySelector('aside')).not.toBeInTheDocument();
    expect(screen.getByText('panel body content')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="drawer-popup"]')).toBeInTheDocument();
  });
});
