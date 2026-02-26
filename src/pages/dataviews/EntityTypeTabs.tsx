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
          <HoverableButton
            className="tab"
            hoverContent={/*... see the old ObjectTypeSelector code ...*/}
            key={type}
            onClick={() => updatePageParams({ objectType: type })}
            style={{
              padding: '0.5em 1em',
              color: isActive ? 'var(--color-button-primary)' : 'var(--color-text)',
              borderWidth: '2px',
              borderRadius: '0.5em 0.5em 0 0',
              borderBottomStyle: 'solid',
              borderBottomColor: isActive ? 'var(--color-button-primary)' : 'auto',
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
