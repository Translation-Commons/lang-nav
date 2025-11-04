import React, { useState } from 'react';

type CommaSeparatedProps = {
  children: React.ReactNode;
  limit?: number | null; // Optionally will clamp the list
};

const CommaSeparated: React.FC<CommaSeparatedProps> = ({ children, limit = 4 }) => {
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
        <button
          style={{ padding: '0em 0.25em', fontWeight: 'normal' }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? 'see less' : '+' + countOverLimit + ' more'}
        </button>
      )}
    </span>
  );
};

export default CommaSeparated;
