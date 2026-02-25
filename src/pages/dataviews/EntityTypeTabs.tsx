import React from 'react';

import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

const ENTITY_TYPES = [
  ObjectType.Language,
  ObjectType.Locale,
  ObjectType.Census,
  ObjectType.Territory,
  ObjectType.WritingSystem,
  ObjectType.VariantTag,
];

const EntityTypeTabs: React.FC = () => {
  const { objectType, updatePageParams } = usePageParams();

  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '0.5em',
        width: '100%',
      }}
    >
      {ENTITY_TYPES.map((type) => {
        const isActive = objectType === type;
        return (
          <button
            key={type}
            onClick={() => updatePageParams({ objectType: type })}
            style={{
              padding: '0.5em 1em',
              background: 'none',
              border: 'none',
              borderRadius: '0',
              outline: 'none',
              boxShadow: 'none',
              borderBottom: isActive
                ? '2px solid var(--color-button-primary)'
                : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: isActive ? 'bold' : 'normal',
              color: isActive ? 'var(--color-button-primary)' : 'var(--color-text-secondary)',
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
};

export default EntityTypeTabs;
