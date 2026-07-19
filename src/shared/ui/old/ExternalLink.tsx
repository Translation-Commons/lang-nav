import { MailIcon } from 'lucide-react';
import React from 'react';

const ExternalLink = ({ href, children }: { href: string; children?: React.ReactNode }) => {
  if (children == null) {
    return <ExternalLink href={href}>{href}</ExternalLink>;
  }
  if (href.startsWith('mailto')) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
        {children}{' '}
        <span aria-hidden="true">
          <MailIcon className="block size-4" />
        </span>
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden="true">↗</span>
    </a>
  );
};

export default ExternalLink;
