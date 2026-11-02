import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import { getFullyInstantiatedMockedEntities } from '@features/__tests__/MockEntities';
import { DataContext } from '@features/data/context/useDataContext';
import { PageParams } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';

import { EntityData, EntityType } from '@entities/types/EntityTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import HoverableEntity from '../HoverableEntity';
import HoverableEntityName from '../HoverableEntityName';

const mockedEnts = getFullyInstantiatedMockedEntities();

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

describe('HoverableEntity', () => {
  let updatePageParams: (params: Partial<PageParams>) => void;

  // Helper function to eliminate mock setup duplication
  const setupMockParams = (overrides: Partial<PageParams> = {}) => {
    const mockUsePageParams = createMockUsePageParams(overrides);
    (usePageParams as Mock).mockReturnValue(mockUsePageParams);
    updatePageParams = mockUsePageParams.updatePageParams;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockParams();
  });

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

  it('a partial entity (API stub) missing what the sort field needs still renders', () => {
    // getLanguageLiteracy walks every locale of the language, which a stub does not have.
    (usePageParams as Mock).mockReturnValue(createMockUsePageParams({ sortBy: Field.Literacy }));
    const stub = { type: EntityType.Language, ID: 'sjn', nameDisplay: 'Sindarin' } as EntityData;
    render(<HoverableEntity ent={stub}>Sindarin stub</HoverableEntity>);
    expect(screen.getByText('Sindarin stub')).toBeInTheDocument();
  });

  it('prefers the fully loaded entity with the same ID and type over a stub', () => {
    const getEntity = vi.fn().mockReturnValue(mockedEnts.sjn);
    const context = { getEntity } as unknown as React.ContextType<typeof DataContext>;
    const stub = { type: EntityType.Language, ID: 'sjn', nameDisplay: 'Stub' } as EntityData;
    render(
      <DataContext.Provider value={context}>
        <HoverableEntity ent={stub}>link</HoverableEntity>
      </DataContext.Provider>,
    );
    expect(getEntity).toHaveBeenCalledWith('sjn');
  });
});
