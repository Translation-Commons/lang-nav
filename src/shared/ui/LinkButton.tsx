import React from 'react';

type Props = {
  href: string;
  title?: string;
};

/**
 * For external links
 */
export default function LinkButton({ href, children, title }: React.PropsWithChildren<Props>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title ?? href}>
      <button
        role="link"
        style={{
          marginLeft: '0.5em',
          marginBottom: '0.25em',
          padding: children !== '' ? '0.25em' : '0',
        }}
      >
        {children} <span aria-hidden={true}>↗</span>
      </button>
    </a>
  );
}
