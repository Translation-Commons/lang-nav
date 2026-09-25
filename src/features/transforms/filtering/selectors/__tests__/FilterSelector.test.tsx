import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getFullyInstantiatedMockedEntities,
  getMockedDataContext,
} from '@features/__tests__/MockEntities';
import { useDataContext } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import Transform from '@features/transforms/TransformEnum';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterSelector from '../FilterSelector';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(),
  Route: vi.fn(),
  Routes: vi.fn(),
  useLocation: vi.fn(() => ({ pathname: '/data' })),
}));
vi.mock('@features/data/context/useDataContext', () => ({
  useDataContext: vi.fn(),
}));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn() }),
}));

describe('FilterSelector', () => {
  beforeEach(() => {
    vi.mocked(usePageParams).mockReturnValue(
      createMockUsePageParams({ entType: EntityType.Locale }),
    );
    vi.mocked(useDataContext).mockReturnValue(
      getMockedDataContext(getFullyInstantiatedMockedEntities()),
    );
  });

  it('renders the correct selector based on the field prop', async () => {
    const { findByText, getByText, rerender } = render(
      <FilterSelector field={Field.LanguageList} />,
    );
    expect(await findByText('Sindarin')).toBeInTheDocument();

    rerender(<FilterSelector field={Field.TerritoryList} />);
    expect(await findByText('Beleriand')).toBeInTheDocument();

    rerender(<FilterSelector field={Field.WritingSystem} />);
    expect(await findByText('Tengwar')).toBeInTheDocument();

    rerender(<FilterSelector field={Field.Modality} />);
    expect(getByText(/Spoken & Written/)).toBeTruthy();
  });

  it('returns null for unsupported fields', () => {
    const result = render(<FilterSelector field={Field.None} />);
    expect(result.container.firstChild).toBeNull();
  });

  it('All supported filters have selectors', async () => {
    const filterBys = getApplicableFields(Transform.Filter, EntityType.Locale);

    for (const field of filterBys) {
      const { container, unmount } = await act(async () =>
        render(<FilterSelector field={field} />),
      );
      expect(container.firstChild, `Field ${field}`).not.toBeNull();
      unmount();
    }
  });
});
