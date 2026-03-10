import React, { useState } from 'react';

type Group<T> = {
  label: string;
  items: T[];
};

type Props<T> = {
  groups: Group<T>[];
  renderItem: (item: T) => React.ReactNode;
};

const GroupedExpanderList = <T,>({ groups, renderItem }: Props<T>) => {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  return (
    <span>
      {groups.map((group, i) => (
        <React.Fragment key={group.label}>
          <button
            style={{ padding: '0em 0.25em', fontWeight: 'normal' }}
            onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
          >
            {group.label} ({group.items.length})
          </button>
          {i < groups.length - 1 && ', '}
          {expandedGroup === group.label && (
            <div style={{ marginTop: '0.25em' }}>
              {group.items.map((item, j) => (
                <React.Fragment key={j}>
                  {renderItem(item)}
                  {j < group.items.length - 1 && ', '}
                </React.Fragment>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}
    </span>
  );
};

export default GroupedExpanderList;
