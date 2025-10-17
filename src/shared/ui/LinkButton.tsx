import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';

type Props = {
  href: string;
};

export default function LinkButton({ href, children }: React.PropsWithChildren<Props>) {
  return (
    <a href={href}>
      <button
        role="link"
        style={{
          marginLeft: '0.5em',
          marginBottom: '0.25em',
          padding: children !== '' ? '0.25em' : '0',
        }}
      >
        {children}
        <ExternalLinkIcon
          size="1em"
          style={{
            marginLeft: '0.25em',
            verticalAlign: 'middle',
            paddingBottom: '0.125em',
            paddingRight: '0.125em',
          }}
        />
      </button>
    </a>
  );
}
