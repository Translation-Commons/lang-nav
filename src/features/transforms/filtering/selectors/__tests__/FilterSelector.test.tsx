import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ObjectType } from '@features/params/PageParamTypes';
import Field from '@features/transforms/fields/Field';
import { getApplicableFields } from '@features/transforms/fields/FieldApplicability';
import Transform from '@features/transforms/TransformEnum';

import { createMockUsePageParams } from '@tests/MockPageParams.test';

import FilterSelector from '../FilterSelector';

vi.mock('@features/params/usePageParams', () => ({
  default: vi.fn().mockReturnValue(createMockUsePageParams({ objectType: ObjectType.Locale })),
}));
vi.mock('@features/layers/hovercard/useHoverCard', () => ({
  default: () => ({ hideHoverCard: vi.fn(), showHoverCard: vi.fn() }),
}));
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(),
  Route: vi.fn(),
  Routes: vi.fn(),
  useLocation: vi.fn(),
}));

describe('FilterSelector', () => {
  it('renders the correct selector based on the field prop', () => {
    const { getByText, rerender } = render(<FilterSelector field={Field.Language} />);
    expect(getByText(/Language/)).toBeTruthy();

    rerender(<FilterSelector field={Field.Territory} />);
    expect(getByText(/Territory/)).toBeTruthy();

    rerender(<FilterSelector field={Field.WritingSystem} />);
    expect(getByText(/Written in/)).toBeTruthy();

    rerender(<FilterSelector field={Field.Modality} />);
    expect(getByText(/Modality/)).toBeTruthy();
  });

  it('returns null for unsupported fields', () => {
    const result = render(<FilterSelector field={Field.None} />);
    expect(result.container.firstChild).toBeNull();
  });

  it('All supported filters have selectors', () => {
    const filterBys = getApplicableFields(Transform.Filter, ObjectType.Locale);

    filterBys.forEach((field) => {
      const { container } = render(<FilterSelector field={field} />);
      expect(container.firstChild, `Field ${field}`).not.toBeNull();
    });
  });
});
