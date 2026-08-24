import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getFullyInstantiatedMockedObjects } from '@features/__tests__/MockObjects';

import HoverableObject from '../HoverableObject';
import HoverableObjectName from '../HoverableObjectName';

const mockedEnts = getFullyInstantiatedMockedObjects();

const showHoverCard = vi.fn();
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({
    showHoverCard,
    hideHoverCard: vi.fn(),
    onMouseLeaveTriggeringElement: vi.fn(),
  }),
}));
vi.mock('@features/params/usePageParams', () => ({ default: vi.fn().mockReturnValue({}) }));

describe('HoverableObject', () => {
  it('an undefined entity will just render the child elements', () => {
    render(<HoverableObject ent={undefined}>undefined entity</HoverableObject>);

    expect(screen.getByText(/undefined entity/)).toBeInTheDocument();
    // hovering does not trigger hover card since entity is undefined
    screen
      .getByText(/undefined entity/)
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).not.toHaveBeenCalled();
  });

  it('a defined entity will have a hover interaction', () => {
    render(<HoverableObject ent={mockedEnts.sjn}>Sindarin</HoverableObject>);

    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
    // move the cursor over the element to trigger the hover card
    screen.getByText(/Sindarin/).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).toHaveBeenCalled();
  });
});

describe('HoverableObjectName', () => {
  it('an undefined entity will not render anything', () => {
    render(<HoverableObjectName ent={undefined} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('a defined entity will render the entity name with hover interaction', () => {
    render(<HoverableObjectName ent={mockedEnts.sjn} />);
    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
    // move the cursor over the element to trigger the hover card
    screen.getByText(/Sindarin/).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).toHaveBeenCalled();
  });

  it("instead of showing a name, the entity's code can be shown", () => {
    render(<HoverableObjectName ent={mockedEnts.sjn} labelSource="code" />);
    expect(screen.getByText(/sjn/)).toBeInTheDocument();
  });

  it('locales by default show the name with the combination of the language and territory', () => {
    render(<HoverableObjectName ent={mockedEnts.sjn_BE} />);
    expect(screen.getByText(/Sindarin \(Beleriand\)/)).toBeInTheDocument();
  });

  it('locales can show just the language name if specified', () => {
    render(<HoverableObjectName ent={mockedEnts.sjn_BE} labelSource="language" />);
    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
  });

  it('locales can show just the language name if specified', () => {
    render(
      <HoverableObjectName ent={mockedEnts.sjn_Teng_123} labelSource="locale without territory" />,
    );
    expect(screen.getByText(/Sindarin \(Tengwar\)/)).toBeInTheDocument();
  });

  it('locales can show just the territory name if specified', () => {
    render(<HoverableObjectName ent={mockedEnts.sjn_BE} labelSource="territory" />);
    expect(screen.getByText(/Beleriand/)).toBeInTheDocument();
  });
});
