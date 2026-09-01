import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getFullyInstantiatedMockedEntities } from '@features/__tests__/MockEntities';

import HoverableEntity from '../HoverableEntity';
import HoverableEntityName from '../HoverableEntityName';

const mockedEnts = getFullyInstantiatedMockedEntities();

const updatePageParams = vi.fn();
vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue({ updatePageParams }),
}));

describe('HoverableEntity', () => {
  it('an undefined entity will just render the child elements', () => {
    render(<HoverableEntity ent={undefined}>undefined entity</HoverableEntity>);

    expect(screen.getByText(/undefined entity/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens the selected entity in the details drawer', () => {
    render(<HoverableEntity ent={mockedEnts.sjn}>Sindarin</HoverableEntity>);

    screen.getByRole('button', { name: 'Sindarin' }).click();
    expect(updatePageParams).toHaveBeenCalledWith({ entID: mockedEnts.sjn.ID });
  });
});

describe('HoverableEntityName', () => {
  it('an undefined entity will not render anything', () => {
    render(<HoverableEntityName ent={undefined} />);
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('a defined entity will render the entity name as a details drawer trigger', () => {
    render(<HoverableEntityName ent={mockedEnts.sjn} />);
    expect(screen.getByRole('button', { name: 'Sindarin' })).toBeInTheDocument();
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
