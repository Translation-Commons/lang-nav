import { CopyIcon } from 'lucide-react';
import React from 'react';

import useCopyToClipboard from '@shared/hooks/useCopyToClipboard';

import { Button } from './button';
import { Spinner } from './spinner';

type Props = React.PropsWithChildren<{
  getTextToCopy: () => string;
  variant?: 'default' | 'secondary' | 'ghost';
}>;

const CopyButton: React.FC<Props> = ({ getTextToCopy, children, variant = 'secondary' }) => {
  const { copy, isCopying } = useCopyToClipboard();
  return (
    <Button
      onClick={() => copy(getTextToCopy())}
      disabled={isCopying}
      variant={variant}
      className={!children ? 'p-1' : ''}
    >
      {isCopying ? <Spinner /> : <CopyIcon />}
      {children}
    </Button>
  );
};

export default CopyButton;
