import { ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@shared/ui/button';

type CommaSeparatedProps = {
  children: React.ReactNode;
  limit?: number | null; // Optionally will clamp the list
  limitText?: 'words' | 'short';
};

const CommaSeparated: React.FC<CommaSeparatedProps> = ({
  children,
  limit = 4,
  limitText = 'words',
}) => {
  const childArray = React.Children.toArray(children);
  const [expanded, setExpanded] = useState(false);
  const countOverLimit = childArray.length - (limit ?? 0);

  return (
    <span>
      {childArray.slice(0, !expanded && limit ? limit : undefined).map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 && ', '}
        </React.Fragment>
      ))}{' '}
      {limit != null && childArray.length > limit && (
        <Button
          variant="link"
          size="xs"
          className="font-normal"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {limitText === 'words' ? (
            expanded ? (
              'see less'
            ) : (
              '+' + countOverLimit + ' more'
            )
          ) : expanded ? (
            <ChevronLeft className="-mx-1 block size-5" />
          ) : (
            '+' + countOverLimit
          )}
        </Button>
      )}
    </span>
  );
};

export default CommaSeparated;
