import React from 'react';

import { ObjectType } from '@features/page-params/PageParamTypes';

import getObjectFromID from '@entities/lib/getObjectFromID';
import HoverableObjectName from '@entities/ui/HoverableObjectName';

const ObjectSuggestions: React.FC<{ objectType: ObjectType }> = ({ objectType }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '1em',
        justifyContent: 'center',
        marginTop: '1em',
      }}
    >
      {getObjectIDs(objectType).map((id) => (
        <HoverableObjectName key={id} object={getObjectFromID(id)} format="button" />
      ))}
    </div>
  );
};

function getObjectIDs(objectType: ObjectType): string[] {
  switch (objectType) {
    case ObjectType.Census:
      return ['ca2021.1', 'ca2021.4', 'in2011c16.1', 'in2011c17.4'];
    case ObjectType.Language:
      return ['eng', 'spa', 'fra', 'rus', 'zho', 'ara'];
    case ObjectType.Locale:
      return ['eng_US', 'spa_419', 'fra_FR', 'rus_RU', 'arb_001', 'zho_Hans_CN', 'cmn_CN'];
    case ObjectType.Territory:
      return ['US', 'MX', 'FR', 'RU', 'EG', 'CN'];
    case ObjectType.VariantTag:
      return ['valencia', 'grclass', 'rumgr', 'pinyin'];
    case ObjectType.WritingSystem:
      return ['Latn', 'Cyrl', 'Arab', 'Hans', 'Hant'];
  }
}

export default ObjectSuggestions;
