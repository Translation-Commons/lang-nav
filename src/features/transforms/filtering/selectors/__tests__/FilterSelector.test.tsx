import { render } from '@testing-library/react';
import { createContext } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import {
  getFullyInstantiatedMockedEntities,
  getMockedDataContext,
} from '@features/__tests__/MockEntities';
import { DataContextType } from '@features/data/context/useDataContext';
import { EntityType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import Transform from '@features/transforms/TransformEnum';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterSelector from '../FilterSelector';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams({ entType: EntityType.Locale })),
}));

vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(),
  Route: vi.fn(),
  Routes: vi.fn(),
  useLocation: vi.fn(() => ({ pathname: '/data' })),
}));
vi.mock('@features/data/DataContext', () => ({
  useDataContext: vi.fn(() =>
    createContext<DataContextType | undefined>(
      getMockedDataContext(getFullyInstantiatedMockedEntities()),
    ),
  ),
}));

describe('FilterSelector', () => {
  it('renders the correct selector based on the field prop', () => {
    const { getByText, rerender } = render(<FilterSelector field={Field.Language} />);
    expect(getByText(/English/)).toBeTruthy();

    rerender(<FilterSelector field={Field.Territory} />);
    expect(getByText(/China/)).toBeTruthy();

    rerender(<FilterSelector field={Field.WritingSystem} />);
    expect(getByText(/Devanagari/)).toBeTruthy();

    rerender(<FilterSelector field={Field.Modality} />);
    expect(getByText(/Spoken & Written/)).toBeTruthy();
  });

  it('returns null for unsupported fields', () => {
    const result = render(<FilterSelector field={Field.None} />);
    expect(result.container.firstChild).toBeNull();
  });

  it('All supported filters have selectors', () => {
    const filterBys = getApplicableFields(Transform.Filter, EntityType.Locale);

    filterBys.forEach((field) => {
      const { container } = render(<FilterSelector field={field} />);
      expect(container.firstChild, `Field ${field}`).not.toBeNull();
    });
  });
});
