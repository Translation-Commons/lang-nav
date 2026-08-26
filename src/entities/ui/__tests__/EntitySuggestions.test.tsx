import { render, screen } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { EntityType } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import getEntityFromID from '../../lib/getEntityFromID';
import EntitySuggestions from '../EntitySuggestions';

vi.mock('../../lib/getEntityFromID', () => ({
  default: vi.fn((id: string) => getBaseLanguageData(id, `ENT:${id}`)),
}));
vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams({})),
}));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({}),
}));

describe('EntitySuggestions', () => {
  it('renders suggestion buttons for EntityType.Language and calls getEntityFromID for each id', () => {
    render(<EntitySuggestions entType={EntityType.Language} />);

    const buttons = screen.getAllByRole('button');
    // Expect the six language IDs from the component implementation
    expect(buttons).toHaveLength(6);

    // Verify specific items rendered
    expect(screen.getByText('ENT:eng')).toBeTruthy();
    expect(screen.getByText('ENT:spa')).toBeTruthy();
    expect(screen.getByText('ENT:zho')).toBeTruthy();

    // Verify getEntityFromID was called for each expected id
    const mock = getEntityFromID as Mock;
    expect(mock).toHaveBeenCalledWith('eng');
    expect(mock).toHaveBeenCalledWith('spa');
    expect(mock).toHaveBeenCalledWith('fra');
    expect(mock).toHaveBeenCalledWith('rus');
    expect(mock).toHaveBeenCalledWith('zho');
    expect(mock).toHaveBeenCalledWith('ara');
  });

  it('renders suggestion buttons for EntityType.Locale and includes expected locale ids', () => {
    render(<EntitySuggestions entType={EntityType.Locale} />);

    const buttons = screen.getAllByRole('button');
    // Expect the seven locale IDs from the component implementation
    expect(buttons).toHaveLength(7);

    // Check a couple of locale renders
    expect(screen.getByText('ENT:eng_US')).toBeTruthy();
    expect(screen.getByText('ENT:zho_Hans_CN')).toBeTruthy();

    const mock = getEntityFromID as Mock;
    expect(mock).toHaveBeenCalledWith('eng_US');
    expect(mock).toHaveBeenCalledWith('zho_Hans_CN');
  });
});
