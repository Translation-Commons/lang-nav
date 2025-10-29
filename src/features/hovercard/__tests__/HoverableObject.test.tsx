import { describe } from 'node:test';

import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';

import { getMockedObjects } from '@tests/MockObjects';

import HoverableObject from '../HoverableObject';
import HoverableObjectName from '../HoverableObjectName';

const mockedObjects = getMockedObjects();

const showHoverCard = vi.fn();
vi.mock('@features/hovercard/useHoverCard', () => ({
  default: () => ({
    showHoverCard,
    hideHoverCard: vi.fn(),
    onMouseLeaveTriggeringElement: vi.fn(),
  }),
}));
vi.mock('@features/page-params/usePageParams', () => ({ default: vi.fn().mockReturnValue({}) }));

describe('HoverableObject', () => {
  it('an undefined object will just render the child elements', () => {
    render(<HoverableObject object={undefined}>undefined object</HoverableObject>);

    expect(screen.getByText(/undefined object/)).toBeInTheDocument();
    // hovering does not trigger hover card since object is undefined
    screen
      .getByText(/undefined object/)
      .dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).not.toHaveBeenCalled();
  });

  it('a defined object will have a hover interaction', () => {
    render(<HoverableObject object={mockedObjects.sjn}>Sindarin</HoverableObject>);

    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
    // move the cursor over the element to trigger the hover card
    screen.getByText(/Sindarin/).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).toHaveBeenCalled();
  });
});

describe('HoverableObjectName', () => {
  it('an undefined object will not render anything', () => {
    render(<HoverableObjectName object={undefined} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('a defined object will render the object name with hover interaction', () => {
    render(<HoverableObjectName object={mockedObjects.sjn} />);
    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
    // move the cursor over the element to trigger the hover card
    screen.getByText(/Sindarin/).dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(showHoverCard).toHaveBeenCalled();
  });

  it("instead of showing a name, the object's code can be shown", () => {
    render(<HoverableObjectName object={mockedObjects.sjn} labelSource="code" />);
    expect(screen.getByText(/sjn/)).toBeInTheDocument();
  });

  it('locales by default show the name with the combination of the language and territory', () => {
    render(<HoverableObjectName object={mockedObjects.sjn_BE} />);
    expect(screen.getByText(/Sindarin \(Beleriand\)/)).toBeInTheDocument();
  });

  it('locales can show just the language name if specified', () => {
    render(<HoverableObjectName object={mockedObjects.sjn_BE} labelSource="language" />);
    expect(screen.getByText(/Sindarin/)).toBeInTheDocument();
  });

  it('locales can show just the territory name if specified', () => {
    render(<HoverableObjectName object={mockedObjects.sjn_BE} labelSource="territory" />);
    expect(screen.getByText(/Beleriand/)).toBeInTheDocument();
  });
});
