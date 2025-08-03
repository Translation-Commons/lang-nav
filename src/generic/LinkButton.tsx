import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';

type Props = {
  href: string;
};

export default function LinkButton({ href, children }: React.PropsWithChildren<Props>) {
  return (
    <a href={href}>
      <button role="link" style={{ marginLeft: '1em', marginBottom: '0.25em', padding: '0.25em' }}>
        {children}
        <ExternalLinkIcon size="1em" style={{ marginLeft: '0.25em' }} />
      </button>
    </a>
  );
}
