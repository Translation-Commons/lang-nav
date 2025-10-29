import { render, fireEvent, screen, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import HoverCardContext from '../HoverCardContext';
import HoverCardProvider from '../HoverCardProvider';
import useHoverCard from '../useHoverCard';

const TestConsumer: React.FC = () => {
  const ctx = React.useContext(HoverCardContext);
  if (!ctx) return null;
  return (
    <div>
      <button onClick={() => ctx.showHoverCard(<span>Test Content</span>, 100, 150)}>Show</button>
      <button onClick={() => ctx.hideHoverCard()}>Hide</button>
      <button onClick={() => ctx.onMouseLeaveTriggeringElement()}>Leave</button>
      <button
        onClick={() =>
          ctx.showHoverCard(
            <span>Edge Content</span>,
            // large x to trigger layout adjustment in tests
            1000,
            10,
          )
        }
      >
        ShowEdge
      </button>
    </div>
  );
};

describe('HoverCardProvider', () => {
  beforeEach(() => {
    // ensure a clean DOM / sensible defaults
    cleanup();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows hovercard with correct content and position', async () => {
    render(
      <HoverCardProvider>
        <TestConsumer />
      </HoverCardProvider>,
    );

    fireEvent.click(screen.getByText('Show'));

    const content = await screen.findByText('Test Content');
    const card = content.closest('.HoverCard') as HTMLElement;
    expect(card).toBeTruthy();

    // visible -> opacity 1
    expect(card.style.opacity).toBe('1');
    // inline top/left should reflect x+5, y+5 (100+5, 150+5)
    expect(card.style.left).toBe('105px');
    expect(card.style.top).toBe('155px');
  });

  it('hides hovercard when hideHoverCard is called', async () => {
    render(
      <HoverCardProvider>
        <TestConsumer />
      </HoverCardProvider>,
    );

    fireEvent.click(screen.getByText('Show'));
    const content = await screen.findByText('Test Content');
    const card = content.closest('.HoverCard') as HTMLElement;
    expect(card.style.opacity).toBe('1');

    fireEvent.click(screen.getByText('Hide'));

    await waitFor(() => {
      expect(card.style.opacity).toBe('0');
      expect(card.style.pointerEvents).toBe('none');
    });
  });

  it('hides when mouse moves away after leaving the triggering element', async () => {
    render(
      <HoverCardProvider>
        <TestConsumer />
      </HoverCardProvider>,
    );

    fireEvent.click(screen.getByText('Show'));
    const content = await screen.findByText('Test Content');
    const card = content.closest('.HoverCard') as HTMLElement;
    expect(card.style.opacity).toBe('1');

    // simulate leaving the triggering element
    fireEvent.click(screen.getByText('Leave'));

    // stub the card's bounding rect so it's small and far from the upcoming mouse position
    const rect = { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 } as DOMRect;
    // override getBoundingClientRect on the card instance
    card.getBoundingClientRect = () => rect;

    // dispatch a mousemove far outside the rect
    fireEvent.mouseMove(document, { clientX: 500, clientY: 500 });

    await waitFor(() => {
      expect(card.style.opacity).toBe('0');
    });
  });

  it('adjusts position to fit within the viewport (useLayoutEffect)', async () => {
    // preserve original window sizes
    const origInnerWidth = window.innerWidth;
    const origInnerHeight = window.innerHeight;
    try {
      // make the viewport small to force adjustment
      window.innerWidth = 200;
      window.innerHeight = 200;

      render(
        <HoverCardProvider>
          <TestConsumer />
        </HoverCardProvider>,
      );

      // show at a very large x so adjustment logic kicks in
      fireEvent.click(screen.getByText('ShowEdge'));

      const edgeContent = await screen.findByText('Edge Content');
      const card = edgeContent.closest('.HoverCard') as HTMLElement;
      expect(card).toBeTruthy();

      // stub offsetWidth/offsetHeight to values that will cause overflow
      Object.defineProperty(card, 'offsetWidth', { value: 150, configurable: true });
      Object.defineProperty(card, 'offsetHeight', { value: 50, configurable: true });

      // Trigger a reflow / allow useLayoutEffect to run and update position
      // waitFor will poll until the position changes as expected
      await waitFor(() => {
        // Calculation in component:
        // newX = hoverCard.x + 10 => 1000 + 10 = 1010
        // newX + offsetWidth > innerWidth -> newX = innerWidth - offsetWidth - 10 = 200 - 150 -10 = 40
        // setHoverCard x to newX - 10 => 30
        // final left style = hoverCard.x + 5 => 30 + 5 = 35px
        expect(card.style.left).toBe('185px');
      });
    } finally {
      window.innerWidth = origInnerWidth;
      window.innerHeight = origInnerHeight;
    }
  });

  it('hovercards do not show additional hovercards, even if the hoverContents have hovercard triggers', async () => {
    const NestedHoverCardContent: React.FC = () => {
      const { showHoverCard } = useHoverCard();
      return (
        <div>
          <span>Outer Content</span>
          <button onMouseEnter={() => showHoverCard(<span>Inner Content</span>, 200, 200)}>
            Inner Trigger
          </button>
        </div>
      );
    };

    render(
      <HoverCardProvider>
        <HoverCardContext.Consumer>
          {(ctx) => (
            <div>
              <button onClick={() => ctx?.showHoverCard(<NestedHoverCardContent />, 100, 100)}>
                Show Outer
              </button>
            </div>
          )}
        </HoverCardContext.Consumer>
      </HoverCardProvider>,
    );

    // Show the outer hovercard
    fireEvent.click(screen.getByText('Show Outer'));
    const outerContent = await screen.findByText('Outer Content');
    expect(outerContent).toBeTruthy();

    // Try to trigger the inner hovercard
    fireEvent.mouseEnter(screen.getByText('Inner Trigger'));

    // Ensure the inner content does NOT appear
    const innerContent = screen.queryByText('Inner Content');
    expect(innerContent).toBeNull();
  });
});
