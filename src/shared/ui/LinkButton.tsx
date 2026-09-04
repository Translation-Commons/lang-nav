import { ArrowUpRightIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@shared/ui/button';

type Props = {
  href: string;
  title?: string;
};

/**
 * For external links
 */
export default function LinkButton({ href, children, title }: React.PropsWithChildren<Props>) {
  return (
    <Button
      role="link"
      variant="secondary"
      render={
        <a href={href} target="_blank" rel="noopener noreferrer" title={title ?? href}>
          {children} <ArrowUpRightIcon />
        </a>
      }
    />
  );
}
