import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import { ObjectData } from '@entities/types/DataTypes';

import { TooltipProvider } from '@shared/ui/tooltip';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import CardInCardList from '../CardInCardList';

vi.mock('@features/params/usePageParams', () => ({ default: vi.fn() }));

const object = {
  ID: '001',
  type: ObjectType.Territory,
  nameDisplay: 'Arda',
} as ObjectData;

function setupParams(overrides = {}) {
  (usePageParams as Mock).mockReturnValue(createMockUsePageParams(overrides));
}

function renderCard(children: React.ReactNode = <span>Body content</span>) {
  return render(
    <TooltipProvider>
      <CardInCardList object={object}>{children}</CardInCardList>
    </TooltipProvider>,
  );
}

describe('CardInCardList', () => {
  afterEach(() => vi.clearAllMocks());

  it('clicking the card body opens the object', () => {
    setupParams();
    renderCard();

    fireEvent.click(screen.getByText('Body content'));

    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ objectID: '001' });
  });

  it('clicking an inner interactive element does NOT open the object', () => {
    setupParams();
    renderCard(<button>Inner</button>);

    fireEvent.click(screen.getByRole('button', { name: 'Inner' }));

    expect(usePageParams().updatePageParams).not.toHaveBeenCalledWith({ objectID: '001' });
  });

  it('pressing Enter opens the object when the card is focused', () => {
    setupParams();
    const { container } = renderCard();
    const card = container.querySelector('.CardInCardList') as HTMLElement;

    fireEvent.keyDown(card, { key: 'Enter' });

    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ objectID: '001' });
  });

  it('pressing Space opens the object when the card is focused', () => {
    setupParams();
    const { container } = renderCard();
    const card = container.querySelector('.CardInCardList') as HTMLElement;

    fireEvent.keyDown(card, { key: ' ' });

    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ objectID: '001' });
  });

  it('the pin button pins an unpinned object', () => {
    setupParams({ pinned: [] });
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Pin to the page' }));

    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ pinned: ['001'] });
  });

  it('the pin button unpins an already-pinned object', () => {
    setupParams({ pinned: ['001'] });
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: 'Unpin from the page' }));

    expect(usePageParams().updatePageParams).toHaveBeenCalledWith({ pinned: [] });
  });
});
