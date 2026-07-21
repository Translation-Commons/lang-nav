import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getBaseLanguageData } from '@entities/language/LanguageTypes';

import ObjectPath from '../ObjectPath';

// ObjectPath (and the hover cards inside it) read page params; only languageSource gates
// rendering, the rest are inert callbacks/values for this test.
vi.mock('@features/params/usePageParams', () => ({
  default: () => ({ languageSource: 'Combined', view: 'CardList', updatePageParams: vi.fn() }),
}));

function buildHierarchy() {
  const grandparent = getBaseLanguageData('gpa', 'Grandparent');
  const parent = getBaseLanguageData('par', 'Parent');
  const child = getBaseLanguageData('chi', 'Child');
  parent.parentLanguage = grandparent;
  child.parentLanguage = parent;
  return { grandparent, parent, child };
}

describe('ObjectPath breadcrumb', () => {
  it('renders the ancestor chain as breadcrumb items with the current object as the page', () => {
    const { child } = buildHierarchy();
    render(<ObjectPath object={child} />);

    const nav = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(nav).toBeInTheDocument();

    // Ancestors appear as breadcrumb links, ordered root-first.
    expect(screen.getByText('Grandparent')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();

    // The selected object is the current (non-link) breadcrumb page.
    const current = screen.getByText('Child');
    expect(current).toHaveAttribute('aria-current', 'page');
  });

  it('renders nothing when there is no object', () => {
    const { container } = render(<ObjectPath object={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('collapses a long ancestor chain behind an ellipsis that expands and re-collapses', () => {
    const root = getBaseLanguageData('roo', 'Root');
    const mid1 = getBaseLanguageData('md1', 'Mid1');
    const mid2 = getBaseLanguageData('md2', 'Mid2');
    const parent = getBaseLanguageData('par', 'Parent');
    const child = getBaseLanguageData('chi', 'Child');
    mid1.parentLanguage = root;
    mid2.parentLanguage = mid1;
    parent.parentLanguage = mid2;
    child.parentLanguage = parent;
    render(<ObjectPath object={child} />);

    // Collapsed: root and direct parent shown, the middle hidden behind the toggle.
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Parent')).toBeInTheDocument();
    expect(screen.queryByText('Mid1')).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Show 2 more ancestors' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Expand: middle ancestors appear and the toggle stays visible as a collapse affordance.
    fireEvent.click(toggle);
    expect(screen.getByText('Mid1')).toBeInTheDocument();
    expect(screen.getByText('Mid2')).toBeInTheDocument();
    const collapse = screen.getByRole('button', { name: 'Hide intermediate ancestors' });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');

    // Re-collapse: middle ancestors hidden again.
    fireEvent.click(collapse);
    expect(screen.queryByText('Mid1')).not.toBeInTheDocument();
  });
});
