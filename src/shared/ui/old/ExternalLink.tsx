import { MailIcon } from 'lucide-react';
import React from 'react';

const ExternalLink = ({ href, children }: { href: string; children?: React.ReactNode }) => {
  if (children == null) {
    return <ExternalLink href={href}>{href}</ExternalLink>;
  }
  if (href.startsWith('mailto')) {
    return (
      <a
        href={href}
        target="_blank"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}
        rel="noreferrer"
      >
        {children}{' '}
        <span aria-hidden="true">
          <MailIcon display="block" size="1em" />
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
