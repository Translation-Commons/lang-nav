import React from 'react';
import ReactDOMServer from 'react-dom/server';

export function reactNodeToString(node: React.ReactNode): string {
  return ReactDOMServer.renderToStaticMarkup(<>{node}</>).replace(/<[^>]+>/g, '');
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
