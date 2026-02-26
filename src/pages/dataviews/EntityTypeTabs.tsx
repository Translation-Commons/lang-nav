import React from 'react';

import HoverableButton from '@features/layers/hovercard/HoverableButton';
import { ObjectType } from '@features/params/PageParamTypes';
import usePageParams from '@features/params/usePageParams';

import ObjectTypeDescription from '@strings/ObjectTypeDescription';

const EntityTypeTabs: React.FC = () => {
  const { objectType, updatePageParams } = usePageParams();

  return (
    <div style={{ display: 'flex', marginBottom: '0.5em', width: '100%' }}>
      {Object.values(ObjectType).map((type) => {
        const isActive = objectType === type;
        return (
          <HoverableButton
            className="tab"
            hoverContent={
              <>
                <div style={{ marginBottom: 8 }}>
                  Click here to change the kind of entity viewed.
                </div>{' '}
                <ObjectTypeDescription objectType={type} />
              </>
            }
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
          </HoverableButton>
        );
      })}
    </div>
  );
};

export default EntityTypeTabs;
