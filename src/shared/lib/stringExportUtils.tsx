import React from 'react';
import ReactDOMServer from 'react-dom/server';

export function reactNodeToString(node: React.ReactNode): string {
  return ReactDOMServer.renderToStaticMarkup(<>{node}</>).replace(/<[^>]+>/g, '');
}

/*
 * Helper functions used for CSV export.
 *
 * These helpers allow conversion of complex React nodes to plain strings and
 * proper escaping of values for comma‐separated value (CSV) files. When a
 * column does not provide its own `exportValue` function, the table will
 * attempt to derive text from the rendered node. These helpers live outside
 * of the component so that they are only defined once.
 */

/** Recursively extract plain text from a ReactNode. */
export function nodeToText(node: React.ReactNode): string {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToText).join(' ');
  }
  // Dive into children on React elements
  if (React.isValidElement(node)) {
    const children = (node.props as { children?: React.ReactNode }).children ?? [];
    return nodeToText(children);
  }
  return '';
}

/** Escape a value for inclusion in a CSV cell. */
export function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  // Escape quotes by doubling them and wrap fields containing commas, quotes or newlines in quotes
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
