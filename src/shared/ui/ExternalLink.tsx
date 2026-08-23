import { MailIcon } from 'lucide-react';
import React from 'react';

type Props = {
  href: string;
  children?: React.ReactNode;
  showDomainOnly?: boolean;
};

const ExternalLink = ({ href, children, showDomainOnly = false }: Props) => {
  const displayText = showDomainOnly ? new URL(href).hostname : (children ?? href);

  if (children == null) {
    return <ExternalLink href={href}>{displayText}</ExternalLink>;
  }
  if (href.startsWith('mailto')) {
    return (
      <a
        href={href}
        target="_blank"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25em' }}
        rel="noreferrer"
      >
        {displayText}{' '}
        <span aria-hidden="true">
          <MailIcon display="block" size="1em" />
        </span>
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {displayText} <span aria-hidden="true">↗</span>
    </a>
  );
};

export default ExternalLink;
