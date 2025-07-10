import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';

export default function LinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href}>
      <button className="LinkButton" role="link">
        {children}
        <ExternalLinkIcon size="1em" style={{ marginLeft: '0.25em' }} />
      </button>
    </a>
  );
}
