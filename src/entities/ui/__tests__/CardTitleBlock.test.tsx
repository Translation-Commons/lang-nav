import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import CardTitleBlock from '../CardTitleBlock';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

function makeLanguage(overrides: Partial<ObjectData> = {}): ObjectData {
  return {
    ID: 'lang-1',
    type: ObjectType.Language,
    nameDisplay: 'Testish',
    ...overrides,
  } as ObjectData;
}

function renderBlock(object: ObjectData, showEndonym = true) {
  (usePageParams as Mock).mockReturnValue(createMockUsePageParams());
  return render(<CardTitleBlock object={object} showEndonym={showEndonym} />);
}

// The subtitle slot is the only italic element in the block.
const subtitleSlot = (container: HTMLElement) =>
  container.querySelector('.italic') as HTMLElement | null;

describe('CardTitleBlock endonym slot', () => {
  afterEach(() => vi.clearAllMocks());

  it('reserves the subtitle line height when showEndonym and an endonym exists', () => {
    const { container } = renderBlock(makeLanguage({ nameEndonym: 'Tëstış' }));

    expect(screen.getByText('Tëstış')).toBeInTheDocument();
    expect(subtitleSlot(container)?.style.minHeight).toBe('0.86rem');
  });

  it('still reserves the subtitle line height when showEndonym but NO endonym exists', () => {
    // A language with no endonym/subtitle: the slot must remain to keep block height constant.
    const { container } = renderBlock(makeLanguage());

    const slot = subtitleSlot(container);
    expect(slot).not.toBeNull();
    expect(slot?.style.minHeight).toBe('0.86rem');
    expect(slot?.textContent?.trim()).toBe('');
  });

  it('renders no subtitle slot when showEndonym is false', () => {
    const { container } = renderBlock(makeLanguage({ nameEndonym: 'Tëstış' }), false);

    expect(subtitleSlot(container)).toBeNull();
  });
});
