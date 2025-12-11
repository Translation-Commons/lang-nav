import { render, screen } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import getObjectFromID from '../../lib/getObjectFromID';
import ObjectSuggestions from '../ObjectSuggestions';

vi.mock('../../lib/getObjectFromID', () => ({
  default: vi.fn((id: string) => getBaseLanguageData(id, `OBJ:${id}`)),
}));
vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams({})),
}));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: vi.fn().mockReturnValue({}),
}));

describe('ObjectSuggestions', () => {
  it('renders suggestion buttons for ObjectType.Language and calls getObjectFromID for each id', () => {
    render(<ObjectSuggestions objectType={ObjectType.Language} />);

    const buttons = screen.getAllByRole('button');
    // Expect the six language IDs from the component implementation
    expect(buttons).toHaveLength(6);

    // Verify specific items rendered
    expect(screen.getByText('OBJ:eng')).toBeTruthy();
    expect(screen.getByText('OBJ:spa')).toBeTruthy();
    expect(screen.getByText('OBJ:zho')).toBeTruthy();

    // Verify getObjectFromID was called for each expected id
    const mock = getObjectFromID as Mock;
    expect(mock).toHaveBeenCalledWith('eng');
    expect(mock).toHaveBeenCalledWith('spa');
    expect(mock).toHaveBeenCalledWith('fra');
    expect(mock).toHaveBeenCalledWith('rus');
    expect(mock).toHaveBeenCalledWith('zho');
    expect(mock).toHaveBeenCalledWith('ara');
  });

  it('renders suggestion buttons for ObjectType.Locale and includes expected locale ids', () => {
    render(<ObjectSuggestions objectType={ObjectType.Locale} />);

    const buttons = screen.getAllByRole('button');
    // Expect the seven locale IDs from the component implementation
    expect(buttons).toHaveLength(7);

    // Check a couple of locale renders
    expect(screen.getByText('OBJ:eng_US')).toBeTruthy();
    expect(screen.getByText('OBJ:zho_Hans_CN')).toBeTruthy();

    const mock = getObjectFromID as Mock;
    expect(mock).toHaveBeenCalledWith('eng_US');
    expect(mock).toHaveBeenCalledWith('zho_Hans_CN');
  });
});
