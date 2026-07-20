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

// The outermost element is the header group that carries the reserved min-height.
const groupBlock = (container: HTMLElement) => container.firstElementChild as HTMLElement;

// The title lives directly inside the group and carries the display name.
const titleLine = (container: HTMLElement) =>
  groupBlock(container).firstElementChild as HTMLElement;

describe('CardTitleBlock header group', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the endonym directly beneath the title with no intra-block reserved gap', () => {
    const { container } = renderBlock(makeLanguage({ nameEndonym: 'Tëstış' }));

    const slot = subtitleSlot(container);
    expect(screen.getByText('Tëstış')).toBeInTheDocument();
    // The endonym itself reserves no height; spacing to the title is a fixed top margin only.
    expect(slot?.style.minHeight).toBe('');
  });

  it('reserves a uniform header min-height on the group so first data rows align', () => {
    const withEndonym = renderBlock(makeLanguage({ nameEndonym: 'Tëstış' }));
    // The group carries a min-height (endonym cards reserve title + endonym lines).
    expect(groupBlock(withEndonym.container).className).toMatch(/min-h-\[/);

    withEndonym.unmount();

    const noEndonym = renderBlock(makeLanguage(), false);
    // Cards without an endonym still reserve a (smaller) uniform header height.
    expect(groupBlock(noEndonym.container).className).toMatch(/min-h-\[/);
  });

  it('never truncates the title (no line clamp)', () => {
    const { container } = renderBlock(makeLanguage({ nameDisplay: 'A very long name' }));

    expect(titleLine(container).className).not.toMatch(/line-clamp/);
  });

  it('renders no subtitle slot when showEndonym but NO endonym exists (group still reserves height)', () => {
    const { container } = renderBlock(makeLanguage());

    expect(subtitleSlot(container)).toBeNull();
    expect(groupBlock(container).className).toMatch(/min-h-\[/);
  });

  it('renders no subtitle slot when showEndonym is false', () => {
    const { container } = renderBlock(makeLanguage({ nameEndonym: 'Tëstış' }), false);

    expect(subtitleSlot(container)).toBeNull();
  });
});
