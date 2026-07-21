import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';

import { buttonVariants } from '@shared/ui/button';

type Props = {
  href: string;
  title?: string;
};

// A single semantic anchor styled as an outline button. Base UI's Button forces a
// `role="button"` onto its rendered element, so we compose the public buttonVariants
// styles onto a plain link to keep true link semantics.
export default function LinkButton({ href, children, title }: React.PropsWithChildren<Props>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title ?? href}
      className={buttonVariants({ variant: 'outline', size: 'sm' })}
    >
      {children}
      <ExternalLinkIcon aria-hidden />
    </a>
  );
}
