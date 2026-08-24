import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getFullyInstantiatedMockedEntities } from '@features/__tests__/MockEntities';

import HoverableEntity from '../HoverableEntity';
import HoverableEntityName from '../HoverableEntityName';

const mockedEnts = getFullyInstantiatedMockedEntities();

const showHoverCard = vi.fn();
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({
    showHoverCard,
    hideHoverCard: vi.fn(),
    onMouseLeaveTriggeringElement: vi.fn(),
  }),
}));
vi.mock('@features/params/usePageParams', () => ({ default: vi.fn().mockReturnValue({}) }));

describe('HoverableEntity', () => {
  it('an undefined entity will just render the child elements', () => {
    render(<HoverableEntity ent={undefined}>undefined entity</HoverableEntity>);

    expect(screen.getByText(/undefined entity/)).toBeInTheDocument();
    // hovering does not trigger hover card since entity is undefined
    screen
      .getByText(/undefined entity/)
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).not.toHaveBeenCalled();
  });

  it('a defined entity will have a hover interaction', () => {
    render(<HoverableEntity ent={mockedEnts.sjn}>Sindarin</HoverableEntity>);

    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
    // move the cursor over the element to trigger the hover card
    screen.getByText(/Sindarin/).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).toHaveBeenCalled();
  });
});

describe('HoverableEntityName', () => {
  it('an undefined entity will not render anything', () => {
    render(<HoverableEntityName ent={undefined} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('a defined entity will render the entity name with hover interaction', () => {
    render(<HoverableEntityName ent={mockedEnts.sjn} />);
    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
    // move the cursor over the element to trigger the hover card
    screen.getByText(/Sindarin/).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).toHaveBeenCalled();
  });

  it("instead of showing a name, the entity's code can be shown", () => {
    render(<HoverableEntityName ent={mockedEnts.sjn} labelSource="code" />);
    expect(screen.getByText(/sjn/)).toBeInTheDocument();
  });

  it('locales by default show the name with the combination of the language and territory', () => {
    render(<HoverableEntityName ent={mockedEnts.sjn_BE} />);
    expect(screen.getByText(/Sindarin \(Beleriand\)/)).toBeInTheDocument();
  });

  it('locales can show just the language name if specified', () => {
    render(<HoverableEntityName ent={mockedEnts.sjn_BE} labelSource="language" />);
    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
  });

  it('locales can show just the language name if specified', () => {
    render(
      <HoverableEntityName ent={mockedEnts.sjn_Teng_123} labelSource="locale without territory" />,
    );
    expect(screen.getByText(/Sindarin \(Tengwar\)/)).toBeInTheDocument();
  });

  it('locales can show just the territory name if specified', () => {
    render(<HoverableEntityName ent={mockedEnts.sjn_BE} labelSource="territory" />);
    expect(screen.getByText(/Beleriand/)).toBeInTheDocument();
  });
});
