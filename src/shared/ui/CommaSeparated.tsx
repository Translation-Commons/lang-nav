import { ChevronLeftIcon } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from './button';

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
          className="size-6 font-normal"
          onClick={() => setExpanded((prev) => !prev)}
          variant="secondary"
        >
          <ButtonText isExpanded={expanded} countOverLimit={countOverLimit} limitText={limitText} />
        </Button>
      )}
    </span>
  );
};

function ButtonText({
  isExpanded,
  countOverLimit,
  limitText,
}: {
  isExpanded: boolean;
  countOverLimit: number;
  limitText: 'words' | 'short';
}) {
  if (limitText === 'words') {
    return isExpanded ? <>see less</> : <>+{countOverLimit} more</>;
  }
  return isExpanded ? <ChevronLeftIcon /> : <>+{countOverLimit}</>;
}

export default CommaSeparated;
