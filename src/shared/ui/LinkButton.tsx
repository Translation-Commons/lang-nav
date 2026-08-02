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
    // added textDecoration to be none to avoid black underline when hovering over text on the button
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title ?? href}
      style={{ textDecoration: 'none' }}
    >
      <button
        role="link"
        style={{
          padding: children !== '' ? '0.25em' : '0',
          alignItems: 'center',
          gap: '0.5em',
          display: 'flex',
          marginTop: '0.25em',
        }}
      >
        {children} <span aria-hidden={true}>↗</span>
      </button>
    </a>
  );
}
