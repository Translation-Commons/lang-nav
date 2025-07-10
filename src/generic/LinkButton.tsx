import React from 'react';
import { ExternalLink } from 'lucide-react';

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
        <ExternalLink size="1em" style={{ marginLeft: '0.25em' }} />
      </button>
    </a>
  );
}
